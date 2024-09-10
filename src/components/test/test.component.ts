import { Component } from '@angular/core';
import {GeoIPDashboardComponent} from "../geo-ipdashboard/geo-ipdashboard.component";
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  standalone: true,
  imports: [
    GeoIPDashboardComponent
  ],
  styleUrls: ['./test.component.scss']
})
export class TestComponent {

}
