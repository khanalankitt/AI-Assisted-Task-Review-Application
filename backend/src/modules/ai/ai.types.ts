export interface AIAnalysisResult {
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
  recommendedAction: string;
}
