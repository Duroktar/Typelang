
export interface ProjectFile {
  id: string;
  name: string;
  content: string;
}

export interface ProjectState {
  files: ProjectFile[];
  activeFileId: string;
  name: string;
}
