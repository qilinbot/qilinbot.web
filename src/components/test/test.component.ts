import { Component } from '@angular/core';
import {GeoIPDashboardComponent} from "../geo-ipdashboard/geo-ipdashboard.component";
import {SelectComponent} from "../select/select.component";
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  standalone: true,
  imports: [
    GeoIPDashboardComponent,
    SelectComponent
  ],
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
  options = [
    { name: 'Script 1', version: '1.0.0' },
    { name: 'Script 2', version: '1.1.0' }
  ];
  selectedOption: { name: string, version: string } | null = null;
}
