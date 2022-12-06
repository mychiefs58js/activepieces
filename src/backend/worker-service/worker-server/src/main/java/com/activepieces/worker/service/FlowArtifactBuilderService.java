package com.activepieces.worker.service;

import com.activepieces.actions.model.action.CodeActionMetadataView;
import com.activepieces.actions.model.action.settings.CodeSettingsView;
import com.activepieces.entity.sql.FileEntity;
import com.activepieces.file.service.FileService;
import com.activepieces.flow.FlowVersionService;
import com.activepieces.flow.model.FlowVersionView;
import com.activepieces.flow.util.FlowVersionUtil;
import com.activepieces.worker.workers.CodeBuildWorker;
import com.github.ksuid.Ksuid;
import lombok.NonNull;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@Log4j2
public class FlowArtifactBuilderService {

    private final CodeBuildService codeBuildService;
    private final FlowVersionService flowVersionService;
    private final FileService fileService;

    @Autowired
    public FlowArtifactBuilderService(
            @NonNull final CodeBuildService codeBuildService,
            @NonNull final FlowVersionService flowVersionService,
            @NonNull final FileService fileService) {
        this.codeBuildService = codeBuildService;
        this.fileService = fileService;
        this.flowVersionService = flowVersionService;
    }

    public FlowVersionView buildAllSteps(@NonNull final FlowVersionView flowVersionView) throws Exception {
        List<CodeActionMetadataView> codeActions = FlowVersionUtil.findCodeActions(flowVersionView);
        boolean changed = false;
        for(CodeActionMetadataView codeAction: codeActions){
            CodeSettingsView codeSettingsView = codeAction.getSettings();
            if(Objects.isNull(codeSettingsView.getArtifactPackagedId())){
                final CodeBuildWorker codeBuildWorker = codeBuildService.obtainWorker();
                final FileEntity fileEntity = fileService.getFileById(codeSettingsView.getArtifactSourceId()).get();
                final InputStream buildStream = codeBuildWorker.build(new ByteArrayInputStream(fileEntity.getData()));
                final FileEntity outputEntity = fileService.save(null,
                        new MockMultipartFile("file",
                                "artifact.zip",
                                "application/zip", buildStream.readAllBytes()));
                codeSettingsView.setArtifactPackagedId(outputEntity.getId());
                changed = true;
            }
        }
        if(changed){
            return flowVersionView;
        }
        return flowVersionService.persistPackagedFlow(flowVersionView);
    }

}
