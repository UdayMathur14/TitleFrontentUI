import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookOpen, ChevronLeft, ChevronRight, Download, Filter, LucideAngularModule, Plus, RefreshCw, Search, Trash2, X } from 'lucide-angular';
import { TitleFilter, TitleRecord } from '../../core/models/title.models';
import { TitleApiService } from '../../core/services/title-api.service';
import { saveBlob } from '../../shared/download';

@Component({selector:'app-title-list',standalone:true,imports:[FormsModule,RouterLink,LucideAngularModule],templateUrl:'./title-list.component.html',styleUrl:'./title-list.component.scss'})
export class TitleListComponent implements OnInit{
 private readonly api=inject(TitleApiService); readonly icons={BookOpen,ChevronLeft,ChevronRight,Download,Filter,Plus,RefreshCw,Search,Trash2,X};
 readonly loading=signal(true);readonly records=signal<TitleRecord[]>([]);readonly total=signal(0);readonly selected=signal(new Set<number>());readonly filterOpen=signal(true);readonly toast=signal('');readonly error=signal('');
 filter:TitleFilter={page:1,pageSize:10,title:'',codeReference:'',invoiceNumber:'',titleYear:'',status:''};
 readonly allSelected=computed(()=>this.records().length>0&&this.records().every(x=>this.selected().has(x.id)));
 ngOnInit(){this.load();}
 load(){this.loading.set(true);this.error.set('');this.api.search(this.filter).subscribe({next:result=>{this.records.set(result.items);this.total.set(result.totalCount);this.loading.set(false);},error:()=>{this.records.set([]);this.total.set(0);this.loading.set(false);this.error.set('Title records could not be loaded. Please make sure the API is running.');}});}
 clear(){this.filter={page:1,pageSize:10,title:'',codeReference:'',invoiceNumber:'',titleYear:'',status:''};this.load();}
 toggle(id:number){const next=new Set(this.selected());next.has(id)?next.delete(id):next.add(id);this.selected.set(next);}
 toggleAll(){this.selected.set(this.allSelected()?new Set():new Set(this.records().map(x=>x.id)));}
 remove(){if(!this.selected().size)return;this.api.deleteMany([...this.selected()]).subscribe({next:()=>{this.selected.set(new Set());this.notify('Selected titles deleted');this.load();},error:()=>this.notify('Delete failed. Please check the API.')});}
 export(){this.api.export(this.filter).subscribe({next:blob=>saveBlob(blob,`title-records-${new Date().toISOString().slice(0,10)}.xlsx`),error:()=>this.notify('Connect the API to export records')});}
 notify(message:string){this.toast.set(message);setTimeout(()=>this.toast.set(''),2600);}
}
