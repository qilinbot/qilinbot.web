import {AfterViewInit, Component, ElementRef, HostListener, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {NzDropDownModule} from "ng-zorro-antd/dropdown";
import {NzIconDirective} from "ng-zorro-antd/icon";
import {MonacoService} from "../../services/monaco.service";

const staticData = {
  regions: ['全部', '北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '南京', '重庆', '西安', '天津', '苏州', '郑州', '长沙', '青岛', '宁波', '沈阳', '哈尔滨', '济南', '太原', '长春', '福州', '厦门', '合肥', '昆明', '贵阳', '南宁', '乌鲁木齐', '兰州', '银川', '呼和浩特', '西宁', '哈尔滨', '海口', '澳门', '香港', '台湾'],
  platforms: ['全部', '京东', '淘宝', '拼多多', '美团', '饿了么', '携程', '去哪儿', '飞猪', '途牛', '去哪儿', '携程', '飞猪', '途牛', '去哪儿', '携程', '飞猪', '途牛', '去哪儿', '携程', '飞猪', '途牛', '去哪儿', '携程', '飞猪'],
  categories: ['全部', '科技', '文化']
}
const selectedCategories = ["regions", "platforms", "categories"];
@Component({
  selector: 'app-geo-ipdashboard',
  standalone: true,
  imports: [CommonModule, NzDropDownModule, NzIconDirective],
  templateUrl: './geo-ipdashboard.component.html',
  styleUrl: './geo-ipdashboard.component.scss'
})
export class GeoIPDashboardComponent {
  selectedCategoriesLabel = {
    regions: "地区",
    platforms: "平台",
    categories: "类别"
  }

  @Input() data: any = staticData;
  selectedRegion: Option
  selectedPlatform: Option
  selectedCategory: Option

  node: string = "请选择结点";
  // 当前显示更多的类别
  showMore: string
  // 判断菜单是否出现
  isDropdownVisible: boolean = false; // 初始情况下，菜单隐藏

  usableNode
  nodeCount: number = 0;

  constructor(private eRef: ElementRef){

  }

  /**
   * 展示更多详情
   */
  toggleMore(category: string){
    if(category === this.showMore) this.showMore = null;
    else this.showMore = category;
  }

  /**
   * 选择筛选条件
   * @param e
   */
  select(e){
    console.log()
    if(e.target.tagName === "SPAN"){
      const elements = e.target.parentElement;
      for(let i = 0; i < elements.children.length; i++){
        elements.children[i].classList.remove('active')
      }
      e.target.classList.add('active');

      // todo 调用接口返回所有的node信息 并更新
    }
  }

  /**
   * 切换下拉菜单的显示状态
   */
  toggleDropdownMenu(): void {
    this.isDropdownVisible = !this.isDropdownVisible;
    setTimeout(() => {
      if(this.selectedCategory && this.selectedRegion && this.selectedPlatform){
        // todo 实现记录功能
      }else {
        this.selectedRegion = {category: "regions", value: "全部", index: 0};
        this.selectedPlatform = {category: "platforms", value: "全部", index: 0};
        this.selectedCategory = {category: "categories", value: "全部", index: 0};
        const elements = document.querySelector(".filter-options-area");
        console.log(elements);
        for(let i = 0; i < elements.children.length; i++){
          elements.children[0].classList.add('active');
        }
      }
    }, 0);
  }

  // 监听全局点击事件
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (this.isDropdownVisible && !this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownVisible = false; // 点击下拉框以外的区域时隐藏菜单
    }
  }

  protected readonly selectedCategories = selectedCategories;
}

// 需要梳理一个数据结构方便这个组件使用的

export interface Option {
  category: string;  // 所属的类别
  value: string;    // 选项的值
  index: number;  // 选项的索引

}
