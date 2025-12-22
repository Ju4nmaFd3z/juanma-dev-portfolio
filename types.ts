
export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link?: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  period: string;
  details?: string;
}
