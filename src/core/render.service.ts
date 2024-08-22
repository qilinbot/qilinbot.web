import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Injectable,
  Injector,
  Renderer2,
  Type
} from '@angular/core';
import {HttpService} from './http.service';
import {NzMessageService} from 'ng-zorro-antd/message';
import Swal from 'sweetalert2';
import {Clipboard} from '@angular/cdk/clipboard';

@Injectable({
  providedIn: 'root',
})
export class RenderService {
  private loadingMessageId:string|undefined = undefined;
  private renderer!:Renderer2;
  constructor(
    protected componentFactoryResolver: ComponentFactoryResolver,
    protected appRef: ApplicationRef,
    protected injector: Injector,
    public http: HttpService,
    private message: NzMessageService,
    private clipboard: Clipboard,
  ) {
  }

  public createComponent<T>(container: any, component: Type<T>, parameters: any = null): ComponentRef<T> {
    let result: ComponentRef<T> = this.componentFactoryResolver
      .resolveComponentFactory(component)
      .create(this.injector);
    if (parameters != null) {
      for (let key in parameters) {
        (result.instance as any)[key] = parameters[key];
      }
    }
    this.appRef.attachView(result.hostView);
    const domElem = (result.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    container.appendChild(domElem);
    return result;
  }

  public destroyComponent<T>(componentRef: ComponentRef<T>) {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
  }


  public isLoading(): boolean {
    return this.loadingMessageId != undefined;
  }

  public showLoading(message: string) {
    this.loadingMessageId = this.message.loading(message, { nzDuration: 0 }).messageId;
  }

  public hideLoading() {
    this.message.remove(this.loadingMessageId);
    this.loadingMessageId = undefined;
  }
  //通知
  public notify(title: string = '通知', content: string) {
    return Swal.fire({
      html: `
                    <div class="title">
                    <p>${title}</p>
                    </div>
                    <div class="message">
                      <p>${content}</p>
                    </div>
`,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      reverseButtons: true,
      customClass: {
        popup: 'SwalCustom--NotifyPopup',
        actions: 'SwalCustom--NotifyActions',
        confirmButton: 'SwalCustom--NotifyConfirmButton',
        cancelButton: 'SwalCustom--NotifyCancelButton',
        htmlContainer: 'SwalCustom--NotifyHtmlContainer'
      }
    });

    // this.notification.blank(
    //     title,
    //     content,
    //     {nzDuration: 0}
    // );
  }

  //信息
  public info(message: string, time = 1500) {
    return new Promise(resolve => {
      resolve(this.message.info(message, { nzDuration: time == -1 ? 0 : time }));
    })
  }

  //错误
  public error(message: string, time = 1500) {
    return new Promise(resolve => {
      console.error(`${message}
            tip:此报错来自主动触发`);
      resolve(this.message.error(message, { nzDuration: time == -1 ? 0 : time }));
    })
  }

  //成功
  public success(message: string, time = 1500) {
    return new Promise(resolve => {
      resolve(this.message.success(message, { nzDuration: time == -1 ? 0 : time }));
    })
  }

  //警告
  public warning(message: string, time = 1500) {
    return new Promise(resolve => {
      resolve(this.message.warning(message, { nzDuration: time == -1 ? 0 : time }));
    })
  }

  /**
   * 复制
   * @param content 内容
   * @param successMsg 成功信息
   * @param errorMsg 失败信息
   */
  public copy(content: any, successMsg: string = '已复制', errorMsg: string = '复制失败') {
    if (!content) {
      this.error('空数据');
      return;
    }
    try {
      globalThis.navigator.clipboard.writeText(content).then(() => { this.success(successMsg) });
    } catch (error) {
      this.clipboard.copy(content) ? this.success(successMsg) : this.error(errorMsg);
    }
  }

  //成功 带确认按钮的消息模态框
  public toastSuccess(message: string) {
    return Swal.fire({
      html: ` <div class="info-title">
                        <i class="CORE core-success_fill" style="color:#FF4D4F"></i>
                        <p>成功</p>
                    </div>
                    <div class="message">
                        <p>${message}</p>
                    </div>
`,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      reverseButtons: true,
      customClass: {
        popup: 'SwalCustom--ToastPopup',
        actions: 'SwalCustom--ToastActions',
        confirmButton: 'SwalCustom--ToastConfirmButton',
        cancelButton: 'SwalCustom--ToastCancelButton',
        htmlContainer: 'SwalCustom--ToastHtmlContainer'
      }
    });
  }

  //失败 带确认按钮的消息模态框
  public toastError(message: string) {
    return Swal.fire({
      html: ` <div class="info-title">
                        <i class="CORE core-error_fill" style="color:#FF4D4F"></i>
                        <p>错误</p>
                    </div>
                    <div class="message">
                        <p>${message}</p>
                    </div>
`,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      reverseButtons: true,
      customClass: {
        popup: 'SwalCustom--ToastPopup',
        actions: 'SwalCustom--ToastActions',
        confirmButton: 'SwalCustom--ToastConfirmButton',
        cancelButton: 'SwalCustom--ToastCancelButton',
        htmlContainer: 'SwalCustom--ToastHtmlContainer'
      }
    });
  }

  //询问
  public confirm(message: string) {
    return Swal.fire({
      title: '询问',
      html: message,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      reverseButtons: true,
      customClass: {
        title: 'SwalCustom--Title',
        actions: 'SwalCustom--Actions',
        confirmButton: 'SwalCustom--ConfirmButton',
        cancelButton: 'SwalCustom--CancelButton',
        container: 'SwalCustom--Container',
        htmlContainer: 'SwalCustom--HtmlContainer'
      }
    });
  }

  public input(title: string, placeHolder: string) {
    return Swal.fire({
      title: title,
      inputPlaceholder: placeHolder,
      input: 'text',
      showCancelButton: true,
      showConfirmButton: true,
      heightAuto: false,
      backdrop: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      customClass: {
        title: 'SwalCustom--InputTitle',
        input: 'SwalCustom--InputBox',
        actions: 'SwalCustom--InputActions',
        confirmButton: 'SwalCustom--InputConfirm',
        cancelButton: 'SwalCustom--InputCancel'
      }
    });
  }
  public inputTextarea(title: string, placeHolder: string) {
    return Swal.fire({
      title: title,
      inputPlaceholder: placeHolder,
      input: 'textarea',
      showCancelButton: true,
      showConfirmButton: true,
      heightAuto: false,
      backdrop: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      customClass: {
        title: 'SwalCustom--InputTitle',
        input: 'SwalCustom--InputBox',
        actions: 'SwalCustom--InputActions',
        confirmButton: 'SwalCustom--InputConfirm',
        cancelButton: 'SwalCustom--InputCancel'
      }
    });
  }

  public valueInput(title: string, value: string) {
    return Swal.fire({
      title: title,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: value,
      input: 'text',
      showCancelButton: true,
      showConfirmButton: true,
      heightAuto: false,
      backdrop: true,
      customClass: {
        title: 'SwalCustom--InputTitle',
        input: 'SwalCustom--InputBox',
        actions: 'SwalCustom--InputActions',
        confirmButton: 'SwalCustom--InputConfirm',
        cancelButton: 'SwalCustom--InputCancel'
      }
    });
  }

}
