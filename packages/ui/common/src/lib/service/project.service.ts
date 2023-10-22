import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, map, tap } from 'rxjs';
import { Project, ProjectId, UpdateProjectRequest } from '@activepieces/shared';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(private http: HttpClient) {}

  update(
    projectId: ProjectId,
    request: UpdateProjectRequest
  ): Observable<Project> {
    return this.http.post<Project>(
      environment.apiUrl + '/projects/' + projectId,
      request
    );
  }

  list(): Observable<Project[]> {
    return this.http.get<Project[]>(environment.apiUrl + '/projects');
  }
  switchProject(projectId: string): Observable<void> {
    return this.http
      .post<{
        token: string;
      }>(`${environment.apiUrl}/projects/${projectId}/token`, {
        projectId,
      })
      .pipe(
        tap(({ token }) => {
          localStorage.setItem(environment.jwtTokenName, token);
          window.location.reload();
        }),
        map(() => void 0)
      );
  }
}
