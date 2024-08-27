import {Component, Input} from '@angular/core';
import {SelectModule, TextInputModule} from "ng-devui";
import {FormsModule} from "@angular/forms";
import {MerkabaRecord, MerkabaScript} from "../../../const/code-editor.page.const";
import {CodeEditorService} from "../../../../../services/code-editor.service";
import {NzOptionComponent, NzSelectComponent, NzSelectModule} from "ng-zorro-antd/select";
import {NzInputDirective} from "ng-zorro-antd/input";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-file-edit-modal',
  standalone: true,
  imports: [
    CommonModule,
    TextInputModule,
    FormsModule,
    NzSelectModule,
    NzInputDirective
  ],
  templateUrl: './file-edit-modal.component.html',
  styleUrls:['./file-edit-modal.component.scss']
})
export class FileEditModalComponent {
  selectedValue = 0
  public editRecord: MerkabaRecord = {type: null, name: '', title: ''};
  constructor(private service: CodeEditorService) {
  }

  initData(data: MerkabaRecord){
    this.editRecord = data;

    console.log(this.editRecord)
  }
  public updateEditRecord(): Promise<MerkabaRecord>{
    return new Promise<MerkabaRecord>((resolve) => {
      // todo 校验数据

      this.editRecord.uri = this.service.assignUri(this.editRecord?.name, this.editRecord?.parentRecord?.uri);
      if(this.editRecord.parentRecord) {
        this.editRecord.seq = this.editRecord.seq || this.editRecord.parentRecord?.children?.length * 10000
      }
      if(this.editRecord.children) {
        this.editRecord.children.forEach(item => item.uri = this.service.assignUri( item.name, this.editRecord.uri))
      }
      let record = Object.assign({},this.editRecord )
      delete record.parentRecord
      this.service.updateRecord(record).subscribe(resp => {
        resolve(resp);
      });
    })
  }

}
