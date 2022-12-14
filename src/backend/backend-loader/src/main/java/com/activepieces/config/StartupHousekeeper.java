package com.activepieces.config;

import com.activepieces.authentication.client.UserAuthenticationService;
import com.activepieces.authentication.client.model.UserInformationView;
import com.activepieces.authentication.client.request.SignUpRequest;
import com.activepieces.entity.sql.Project;
import com.activepieces.flag.service.FlagService;
import com.activepieces.guardian.client.exception.PermissionDeniedException;
import com.activepieces.project.client.ProjectService;
import com.activepieces.project.client.model.CreateProjectRequest;
import com.activepieces.project.client.model.ProjectView;
import com.activepieces.worker.Constants;
import lombok.NonNull;
import org.apache.commons.lang3.RandomStringUtils;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

@Component
public class StartupHousekeeper {

    private final UserAuthenticationService authenticationService;
    private final ProjectService projectService;
    private final Scheduler scheduler;

    @Autowired
    public StartupHousekeeper(@NonNull final UserAuthenticationService authenticationService,
                              @NonNull final Scheduler scheduleService,
                              @NonNull final ProjectService projectService) {
        this.authenticationService = authenticationService;
        this.projectService = projectService;
        this.scheduler = scheduleService;
    }

    @EventListener(ContextRefreshedEvent.class)
    public void contextRefreshedEvent() throws SchedulerException, IOException {
        final UserInformationView user = authenticationService.getOptional("admin@activepieces.com")
                .orElse(authenticationService.create("admin@activepieces.com",
                        SignUpRequest.builder().firstName("Activepieces")
                                .lastName("Admin")
                                .password("password")
                                .build()));
        final List<ProjectView> projectViewList = projectService.listByOwnerId(user.getId());
        if (projectViewList.isEmpty()) {
            final ProjectView projectView = projectService.create(user.getId(), CreateProjectRequest.builder()
                    .displayName("Project")
                    .build());
            scheduler.clear();
        }
        // Place worker js
        final Resource workerExecutor = new ClassPathResource(Constants.ACTIVEPIECES_WORKER_JS);
        final File temp = new File(Constants.ACTIVEPIECES_WORKER_JS);
        Files.copy(
                workerExecutor.getInputStream(),
                temp.toPath(),
                StandardCopyOption.REPLACE_EXISTING);
    }

}
