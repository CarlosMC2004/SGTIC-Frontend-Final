import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-request-advance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-request-advance.html',
  styleUrls: ['./modal-request-advance.css']
})
export class RequestAdvanceModalComponent implements OnInit {

  @Input() student: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() send = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  requestForm!: FormGroup;
  minDate: string = '';

  ngOnInit() {
    this.minDate = new Date().toISOString().split('T')[0];

    this.requestForm = this.fb.group({
      expectedTitle: ['', Validators.required],
      reason: ['', Validators.required],
      deadline: ['', Validators.required],
      instructions: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onClose() {
    this.close.emit();
  }

  onSend() {
    if (this.requestForm.valid) {
      this.send.emit({
        idWork: this.student.idWork,
        ...this.requestForm.value
      });
    } else {
      this.requestForm.markAllAsTouched();
    }
  }
}
