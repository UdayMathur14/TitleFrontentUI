import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowLeft, Check, CircleAlert, CloudUpload, Download, FileCheck2, FileSpreadsheet, Info, LucideAngularModule, Save, ShieldAlert, Trash2 } from 'lucide-angular';
import { ImportPreview } from '../../core/models/title.models';
import { TitleApiService } from '../../core/services/title-api.service';
import { saveBlob } from '../../shared/download';

@Component({selector:'app-title-upload',standalone:true,imports:[RouterLink,LucideAngularModule],templateUrl:'./title-upload.component.html',styleUrl:'./title-upload.component.scss'})
export class TitleUploadComponent{
 private readonly api=inject(TitleApiService);readonly icons={ArrowLeft,Check,CircleAlert,CloudUpload,Download,FileCheck2,FileSpreadsheet,Info,Save,ShieldAlert,Trash2};
 readonly file=signal<File|null>(null);readonly drag=signal(false);readonly loading=signal(false);readonly preview=signal<ImportPreview|null>(null);readonly toast=signal('');
 choose(event:Event){const input=event.target as HTMLInputElement;if(input.files?.[0])this.setFile(input.files[0]);}
 drop(event:DragEvent){event.preventDefault();this.drag.set(false);if(event.dataTransfer?.files[0])this.setFile(event.dataTransfer.files[0]);}
 setFile(file:File){if(!file.name.match(/\.xlsx?$/i)){this.notify('Please choose an Excel file');return;}this.file.set(file);this.preview.set(null);}
 remove(){this.file.set(null);this.preview.set(null);}
 validate(){const file=this.file();if(!file)return;this.loading.set(true);this.api.previewImport(file).subscribe({next:value=>{this.preview.set(value);this.loading.set(false);},error:()=>{this.preview.set(this.mockPreview(file.name));this.loading.set(false);this.notify('Demo preview loaded — connect API for your file data');}});}
 commit(){const value=this.preview();if(!value)return;this.loading.set(true);this.api.commitImport(value.importToken).subscribe({next:()=>{this.loading.set(false);this.notify(`${value.cleanCount} clean titles saved successfully`);},error:()=>{this.loading.set(false);this.notify('Demo mode: import is ready to save');}});}
 template(){this.api.template().subscribe({next:blob=>saveBlob(blob,'UploadTitles.xlsx'),error:()=>this.notify('Connect the API to download the template')});}
 notify(message:string){this.toast.set(message);setTimeout(()=>this.toast.set(''),2800);}
 private mockPreview(fileName:string):ImportPreview{return{fileName,totalRows:8,cleanCount:5,blockedCount:2,invalidCount:1,importToken:'demo-token',rows:[{rowNumber:2,title:'Global IP Strategy Review',invoiceNumber:'INV-2026-140',codeReference:'CR-4612',titleYear:'2026-27',category:'Clean',message:'Ready to import'},{rowNumber:3,title:'Patent Leaders Europe',invoiceNumber:'INV-2026-141',codeReference:'CR-4613',titleYear:'2026-27',category:'Clean',message:'Ready to import'},{rowNumber:4,title:'Asia Pacific Legal Directory',invoiceNumber:'INV-2026-142',codeReference:'CR-4614',titleYear:'2026-27',category:'Blocked',message:'Title already exists',blockedByInvoiceNumber:'INV-2026-116'},{rowNumber:5,title:'Trademark Annual 2026',invoiceNumber:'',codeReference:'CR-4615',titleYear:'2026-27',category:'Invalid',message:'Invoice number is required'},{rowNumber:6,title:'Corporate Counsel India',invoiceNumber:'INV-2026-143',codeReference:'CR-4616',titleYear:'2026-27',category:'Clean',message:'Ready to import'}]};}
}
