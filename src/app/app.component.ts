import {AfterViewInit, Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HttpClient, HttpClientModule} from "@angular/common/http";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
  constructor(private http: HttpClient) {
  }

  // ngAfterViewInit(){
  //   this.http.post("http://api-pre.runtongqiuben.com/User/auth", {}).subscribe(res => {
  //     console.log(res);
  //     // 只有在登录的情况下才能请求
  //     this.http.get("http://api-pre.runtongqiuben.com/Organize/load").subscribe(res => {
  //       console.log(res);
  //     })
  //     this.http.post("", {id: "63b91f65755dda7cde7e6624"}).subscribe((res: any) => {
  //       console.log(res.content);
  //     })
  //   })
  // }

}
