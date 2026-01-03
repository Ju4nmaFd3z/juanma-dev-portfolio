
export interface Project {
  title: string;
  desc: string;
  category: 'software' | 'systems';
  tech: string[];
  icon: string;
  gradient: string;
  image: string;
  url: string;
}

export interface Experience {
  role: string;
  type: string;
  company: string;
  location: string;
  period: string;
  points: string[];
  tags: string[];
}

export interface Education {
  degree: string;
  school: string;
  period: string;
  status: string;
  desc: string;
  highlights?: string[];
}
