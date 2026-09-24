import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({ selector: 'app-feature-shell', template: '<p>{{ title }} shell is ready.</p>' })
export class FeatureShellComponent {
  readonly title = this.route.snapshot.data['title'] as string;

  constructor(private readonly route: ActivatedRoute) {}
}
