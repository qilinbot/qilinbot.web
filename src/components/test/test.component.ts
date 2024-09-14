import { Component } from '@angular/core';
import {GeoIPDashboardComponent} from "../geo-ipdashboard/geo-ipdashboard.component";
import {SelectComponent} from "../select/select.component";
import {JsonEditorComponent} from "../json-editor/json-editor.component";
import {EditInputComponent} from "../edit-input/edit-input.component";
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  standalone: true,
  imports: [
    GeoIPDashboardComponent,
    SelectComponent,
    JsonEditorComponent,
    EditInputComponent
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
