import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contribution, Project, ProjectView } from 'src/app/models/models';
import { serverAPIURL } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);

  readonly API_URL: string = `${serverAPIURL}/api/projects`;

  /** All projects for the account, each bundled with its per-currency saved totals. */
  list(account: string): Observable<ProjectView[]> {
    const params = new HttpParams().append('account', account);
    return this.http.get<ProjectView[]>(this.API_URL, { params });
  }

  findOne(id: string): Observable<ProjectView> {
    return this.http.get<ProjectView>(`${this.API_URL}/${id}`);
  }

  save(project: Project): Observable<Project> {
    return this.http.post<Project>(this.API_URL, project);
  }

  update(id: string, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.API_URL}/${id}`, project);
  }

  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  contributions(projectId: string): Observable<Contribution[]> {
    return this.http.get<Contribution[]>(`${this.API_URL}/${projectId}/contributions`);
  }

  addContribution(projectId: string, contribution: Contribution): Observable<Contribution> {
    return this.http.post<Contribution>(`${this.API_URL}/${projectId}/contributions`, contribution);
  }

  deleteContribution(contributionId: string): Observable<unknown> {
    return this.http.delete(`${this.API_URL}/contributions/${contributionId}`);
  }
}
