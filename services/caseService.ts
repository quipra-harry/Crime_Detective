import type { Case } from '../types';

const CASES_KEY = 'criminalVisionCases';

export const getCases = (): Case[] => {
  try {
    const casesJson = localStorage.getItem(CASES_KEY);
    if (casesJson) {
      const cases = JSON.parse(casesJson) as Case[];
      // Sort by newest first
      return cases.sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (error) {
    console.error("Failed to parse cases from localStorage", error);
  }
  return [];
};

export const saveCase = (newCase: Case): void => {
  const existingCases = getCases();
  // Simple check to avoid duplicates if reset is hit multiple times
  if (existingCases.some(c => c.id === newCase.id)) {
      return;
  }
  const updatedCases = [newCase, ...existingCases];
  try {
    localStorage.setItem(CASES_KEY, JSON.stringify(updatedCases));
  } catch (error) {
    console.error("Failed to save case to localStorage", error);
  }
};
