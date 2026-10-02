export interface ExampleFile {
  name: string;
  content: string;
}

export interface ExampleProgram {
  id: string;
  name: string;
  category: string;
  description: string;
  title?: string;
  code?: string;
  files?: ExampleFile[];
  expectsErrors?: boolean;
}
