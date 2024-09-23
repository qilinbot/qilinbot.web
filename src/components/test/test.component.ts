import { Component } from '@angular/core';
import {GeoIPDashboardComponent} from "../geo-ipdashboard/geo-ipdashboard.component";
import {SelectComponent} from "../select/select.component";
import {JsonEditorComponent} from "../json-editor/json-editor.component";
import {EditInputComponent} from "../edit-input/edit-input.component";
import {ContenteditableInputComponent} from "../contenteditable-input/contenteditable-input.component";
import {NzModalComponent, NzModalContentDirective, NzModalService} from "ng-zorro-antd/modal";
import {NzButtonComponent} from "ng-zorro-antd/button";
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  standalone: true,
  imports: [
    GeoIPDashboardComponent,
    SelectComponent,
    JsonEditorComponent,
    EditInputComponent,
    ContenteditableInputComponent,
    NzModalComponent,
    NzButtonComponent,
    NzModalContentDirective
  ],
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
  json = "";
  mode: 'code' | 'view';

  // constructor() {
  //   this.mode = 'view';
  // }

  changeMode() {
    this.mode = this.mode === 'code' ? 'view' : 'code';
  }

  valueChange(e){
    console.log(e)
  }

  isVisible = false;

  constructor(private modalService: NzModalService) {}

  showModal(): void {
    this.isVisible = true;
  }

  handleOk(): void {
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }

  showConfirm(): void {
    this.modalService.confirm({
      nzTitle: 'Confirm',
      nzContent: 'Bla bla ...',
      nzOkText: 'OK',
      nzCancelText: 'Cancel'
    });
  }
}
