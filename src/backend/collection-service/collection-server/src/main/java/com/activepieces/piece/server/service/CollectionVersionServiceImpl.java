package com.activepieces.piece.server.service;

import com.activepieces.cache.ConditionalCache;
import com.activepieces.common.SeekPageRequest;
import com.activepieces.common.error.ErrorServiceHandler;
import com.activepieces.common.error.exception.InvalidImageFormatException;
import com.activepieces.common.error.exception.flow.FlowNotFoundException;
import com.activepieces.common.error.exception.flow.FlowVersionAlreadyLockedException;
import com.activepieces.common.error.exception.flow.FlowVersionNotFoundException;
import com.activepieces.entity.enums.*;
import com.activepieces.entity.nosql.Collection;
import com.activepieces.entity.nosql.CollectionVersion;
import com.activepieces.flow.FlowService;
import com.activepieces.flow.FlowVersionService;
import com.activepieces.flow.model.FlowVersionView;
import com.activepieces.flow.model.FlowView;
import com.activepieces.guardian.client.PermissionService;
import com.activepieces.guardian.client.exception.PermissionDeniedException;
import com.activepieces.guardian.client.exception.ResourceNotFoundException;
import com.activepieces.piece.client.CollectionVersionService;
import com.activepieces.common.error.exception.collection.CollectionInvalidStateException;
import com.activepieces.common.error.exception.collection.CollectionNotFoundException;
import com.activepieces.common.error.exception.collection.CollectionVersionAlreadyLockedException;
import com.activepieces.common.error.exception.collection.CollectionVersionNotFoundException;
import com.activepieces.piece.client.mapper.CollectionVersionMapper;
import com.activepieces.piece.client.model.CollectionVersionView;
import com.activepieces.piece.client.model.CollectionMetaVersionView;
import com.activepieces.piece.server.repository.CollectionRepository;
import com.activepieces.piece.server.repository.CollectionVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CollectionVersionServiceImpl implements CollectionVersionService {

  private final CollectionVersionRepository collectionVersionRepository;
  private final CollectionVersionMapper collectionVersionMapper;
  private final FlowVersionService flowVersionService;
  private final PermissionService permissionService;
  private final FlowService flowService;
  private final CollectionRepository collectionRepository;
  private final ErrorServiceHandler errorServiceHandler;
  private final ConditionalCache<UUID, Optional<CollectionVersion>> conditionalCache;

  @Autowired
  public CollectionVersionServiceImpl(
      final CollectionVersionRepository collectionVersionRepository,
      final FlowVersionService flowVersionService,
      final PermissionService permissionService,
      final ErrorServiceHandler errorServiceHandler,
      final CollectionRepository collectionRepository,
      final FlowService flowService,
      final CollectionVersionMapper collectionVersionMapper) {
    Function<UUID, Optional<CollectionVersion>> generatorFunction =
        collectionVersionRepository::findById;
    Function<Optional<CollectionVersion>, Boolean> cacheCondition =
        pieceVersionOptional ->
            pieceVersionOptional.isPresent()
                && pieceVersionOptional.get().getState().equals(EditState.LOCKED);
    this.conditionalCache = new ConditionalCache<>(generatorFunction, cacheCondition);

    this.collectionVersionMapper = collectionVersionMapper;
    this.permissionService = permissionService;
    this.collectionRepository = collectionRepository;
    this.errorServiceHandler = errorServiceHandler;
    this.flowService = flowService;
    this.flowVersionService = flowVersionService;
    this.collectionVersionRepository = collectionVersionRepository;
  }

  @Override
  public CollectionVersionView create(
      UUID collectionId,
      UUID previousVersionId,
      CollectionVersionView view,
      Optional<MultipartFile> logo)
      throws ResourceNotFoundException, InvalidImageFormatException, IOException,
          PermissionDeniedException, CollectionVersionNotFoundException {
    permissionService.requiresPermission(collectionId, Permission.WRITE_COLLECTION);
    UUID newVersionIUd = UUID.randomUUID();
    CollectionVersionView savedView =
        saveFromView(
            view.toBuilder()
                .collectionId(collectionId)
                .id(newVersionIUd)
                .state(EditState.DRAFT)
                .flowsVersionId(Collections.emptySet())
                .epochCreationTime(Instant.now().getEpochSecond())
                .epochUpdateTime(Instant.now().getEpochSecond())
           /// TODO FIX
                    //     .logoUrl(logo.isPresent() ? imageService.upload(logo.get()) : view.getLogoUrl())
                .build());
    permissionService.createResourceWithParent(
        savedView.getId(), savedView.getCollectionId(), ResourceType.COLLECTION_VERSION);
    return savedView;
  }

  @Override
  public Optional<CollectionVersionView> getOptional(UUID id) throws PermissionDeniedException {
    Optional<CollectionVersion> optional = conditionalCache.get(id);
    if (optional.isEmpty()) {
      return Optional.empty();
    }
    Optional<Collection> piece = collectionRepository.findById(optional.get().getCollectionId());
    permissionService.requiresPermission(optional.get().getId(), Permission.READ_COLLECTION);
    return optional.map(collectionVersionMapper::toView);
  }

  @Override
  public CollectionVersionView get(UUID id)
      throws CollectionVersionNotFoundException, PermissionDeniedException {
    return getOptional(id).orElseThrow(() -> new CollectionVersionNotFoundException(id));
  }

  @Override
  public CollectionVersionView update(
      UUID id, CollectionVersionView view, Optional<MultipartFile> logo)
      throws PermissionDeniedException, CollectionVersionNotFoundException,
          InvalidImageFormatException, IOException, CollectionVersionAlreadyLockedException {
    permissionService.requiresPermission(id, Permission.WRITE_COLLECTION);
    CollectionVersionView currentVersion = get(id);
    if (currentVersion.getState().equals(EditState.LOCKED)) {
      throw new CollectionVersionAlreadyLockedException(id);
    }
    CollectionVersionView savedView =
        saveFromView(
            currentVersion.toBuilder()
                .displayName(view.getDisplayName())
                .description(view.getDescription())
                .configs(view.getConfigs())
                .epochUpdateTime(Instant.now().getEpochSecond())
               // TODO FIX
                    //  .logoUrl(logo.isPresent() ? imageService.upload(logo.get()) : view.getLogoUrl())
                .build());
    return saveFromView(savedView);
  }

  @Override
  public List<CollectionMetaVersionView> listByCollectionId(UUID collectionId)
      throws CollectionNotFoundException, PermissionDeniedException {
    permissionService.requiresPermission(collectionId, Permission.READ_COLLECTION);
    Optional<Collection> collection = collectionRepository.findById(collectionId);
    if (collection.isEmpty()) {
      throw new CollectionNotFoundException(collectionId);
    }
    List<CollectionMetaVersionView> collectionVersionMetaViews =
        collectionVersionRepository.findAllByCollectionId(collectionId).stream()
            .map(version -> collectionVersionMapper.toMeta(collectionVersionMapper.toView(version)))
            .collect(Collectors.toList());
    return collection.get().getVersionsList().stream()
        .map(
            vId ->
                collectionVersionMetaViews.stream()
                    .filter(f -> f.getId().equals(vId))
                    .findFirst()
                    .get())
        .collect(Collectors.toList());
  }

  @Override
  public void commit(UUID id)
      throws PermissionDeniedException, CollectionVersionNotFoundException,
          CollectionVersionAlreadyLockedException, FlowNotFoundException,
          CollectionInvalidStateException {
    permissionService.requiresPermission(id, Permission.WRITE_COLLECTION);
    CollectionVersionView currentVersion = get(id);
    if (currentVersion.getState().equals(EditState.LOCKED)) {
      throw new CollectionVersionAlreadyLockedException(id);
    }
    List<FlowView> flowViews =
        flowService
            .listByCollectionId(
                currentVersion.getCollectionId(),
                new SeekPageRequest(null, null, Integer.MAX_VALUE))
            .getData();
    for (FlowView flowView : flowViews) {
      if (!flowView.getLastVersion().isValid()) {
        throw new CollectionInvalidStateException(currentVersion.getDisplayName());
      }
    }
    Set<UUID> flowVersionIds =
        flowViews.stream()
            .map(f -> f.getLastVersion().getId())
            .collect(Collectors.toSet());
    commitFlows(flowVersionIds);
    saveFromView(
        currentVersion.toBuilder().flowsVersionId(flowVersionIds).state(EditState.LOCKED).build());
  }

  private void commitFlows(Set<UUID> versionsList) {
    versionsList.forEach(
        f -> {
          try {
            FlowVersionView flowVersionView = flowVersionService.get(f);
            try {
              flowVersionService.lock(flowVersionView.getId());
            } catch (FlowVersionAlreadyLockedException ignored) {
            }
          } catch (FlowVersionNotFoundException | PermissionDeniedException e) {
            throw errorServiceHandler.createInternalError(CollectionVersionServiceImpl.class, e);
          }
        });
  }

  private CollectionVersionView saveFromView(CollectionVersionView versionView) {
    return collectionVersionMapper.toView(
        collectionVersionRepository.save(collectionVersionMapper.fromView(versionView)));
  }
}
