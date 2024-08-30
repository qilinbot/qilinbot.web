import { Injectable } from '@angular/core';
import {CodeEditorService} from "./code-editor.service";

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  constructor(private service: CodeEditorService) {

  }
}
