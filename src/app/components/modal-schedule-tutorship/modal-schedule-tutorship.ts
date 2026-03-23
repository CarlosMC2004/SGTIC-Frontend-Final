import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {AssignedWorkDTO} from '../../models/tutorship.model';

export interface AssignedWorkOption {
  idWork: number;
  studentName: string;
  thesisTitle: string;
}

@Component({
  selector: 'app-modal-schedule-tutorship',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-schedule-tutorship.html',
  styleUrls: ['./modal-schedule-tutorship.css']
})
export class ScheduleTutorshipModalComponent implements OnInit {

  @Input() assignedWorks: AssignedWorkDTO[] = [];
  @Input() isSubmitting: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  scheduleForm!: FormGroup;
  minDate: string = '';

  ngOnInit() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.scheduleForm = this.fb.group({
      idWork: ['', Validators.required],
      date: ['', Validators.required],
      type: ['', Validators.required],
      modality: ['', Validators.required],
      locationLink: ['', Validators.required],
      observations: ['']
    });
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (this.scheduleForm.valid) {
      this.save.emit(this.scheduleForm.value);
    } else {
      this.scheduleForm.markAllAsTouched();
    }
  }
}
