import { Component } from '@angular/core';
import {GeoIPDashboardComponent} from "../geo-ipdashboard/geo-ipdashboard.component";
import {SelectComponent} from "../select/select.component";
import {JsonEditorComponent} from "../json-editor/json-editor.component";
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  standalone: true,
  imports: [
    GeoIPDashboardComponent,
    SelectComponent,
    JsonEditorComponent
  ],
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
  json = "";
  mode: 'code' | 'view';

  constructor() {
    this.mode = 'view';
  }

  changeMode() {
    this.mode = this.mode === 'code' ? 'view' : 'code';
  }
}
