package com.activepieces.flow.validator.constraints;

import com.activepieces.common.code.ArtifactFile;
import com.activepieces.actions.model.action.ActionMetadataView;
import com.activepieces.flow.model.FlowVersionView;
import com.activepieces.flow.util.FlowVersionUtil;
import com.activepieces.flow.validator.FlowVersionRequestBuilder;

import java.util.*;
import java.util.stream.Collectors;

public class FlowValidValidator implements FlowVersionRequestBuilder {

  @Override
  public FlowVersionView construct(
      UUID projectId,
      UUID collectionId,
      FlowVersionView flowVersion,
      List<ArtifactFile> artifactFileList,
      FlowVersionView draftVersion) {
    List<Boolean> actionsValidity =
        FlowVersionUtil.findAllActions(flowVersion).stream()
            .map(ActionMetadataView::isValid)
            .collect(Collectors.toList());
    boolean valid = flowVersion.isValid() && flowVersion.getErrors().size() == 0;
    for (boolean actionValid : actionsValidity) {
      valid = valid && actionValid;
    }
    return flowVersion.toBuilder().valid(valid).build();
  }
}
