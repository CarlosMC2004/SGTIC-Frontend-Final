export interface TutorshipRequestDTO {
  idWork: number;
  date: string;
  type: string;
  modality: string;
  locationLink: string;
  observations?: string | null;
}

export interface TutorshipResponseDTO {
  idTutoring: number;
  studentName: string;
  thesisTitle: string;
  date: string;
  type: string;
  modality: string;
  locationLink: string;
  status: 'pending' | 'completed' | 'proposed';
  observations: string | null;
}

export interface AssignedWorkDTO {
  idWork: number;
  studentName: string;
  title: string;
}
