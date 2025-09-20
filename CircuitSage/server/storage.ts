import { 
  type Formula, 
  type InsertFormula,
  type Constant,
  type InsertConstant,
  type Calculation,
  type InsertCalculation
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Formula operations
  getFormulas(): Promise<Formula[]>;
  getFormula(id: string): Promise<Formula | undefined>;
  createFormula(formula: InsertFormula): Promise<Formula>;
  updateFormula(id: string, formula: InsertFormula): Promise<Formula | undefined>;
  deleteFormula(id: string): Promise<boolean>;

  // Constant operations
  getConstants(): Promise<Constant[]>;
  getConstant(id: string): Promise<Constant | undefined>;
  createConstant(constant: InsertConstant): Promise<Constant>;
  updateConstant(id: string, constant: InsertConstant): Promise<Constant | undefined>;
  deleteConstant(id: string): Promise<boolean>;

  // Calculation operations
  getCalculations(): Promise<Calculation[]>;
  createCalculation(calculation: InsertCalculation): Promise<Calculation>;
  clearCalculations(): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private formulas: Map<string, Formula>;
  private constants: Map<string, Constant>;
  private calculations: Map<string, Calculation>;

  constructor() {
    this.formulas = new Map();
    this.constants = new Map();
    this.calculations = new Map();
    
    // Initialize with some default formulas and constants
    this.seedData();
  }

  private async seedData() {
    // Default formulas
    const defaultFormulas: Formula[] = [
      {
        id: "ohms-law-voltage",
        name: "Ohm's Law (Voltage)",
        formula: "I * R",
        description: "Calculates voltage from current and resistance: V = I × R",
        category: "Basic Electronics",
        variables: ["I", "R"]
      },
      {
        id: "power-vi",
        name: "Power (Voltage × Current)", 
        formula: "V * I",
        description: "Calculates power from voltage and current: P = V × I",
        category: "Power Calculations",
        variables: ["V", "I"]
      },
      {
        id: "rc-time-constant",
        name: "RC Time Constant",
        formula: "R * C",
        description: "Time constant for RC circuit: τ = R × C",
        category: "AC Analysis",
        variables: ["R", "C"]
      }
    ];

    // Default constants
    const defaultConstants: Constant[] = [
      {
        id: "speed-of-light",
        name: "Speed of Light",
        symbol: "c",
        value: 299792458,
        unit: "m/s",
        description: "Speed of electromagnetic radiation in vacuum"
      },
      {
        id: "elementary-charge",
        name: "Elementary Charge",
        symbol: "e",
        value: 1.602176634e-19,
        unit: "C",
        description: "Electric charge of a single proton"
      }
    ];

    defaultFormulas.forEach(formula => this.formulas.set(formula.id!, formula));
    defaultConstants.forEach(constant => this.constants.set(constant.id!, constant));
  }

  // Formula operations
  async getFormulas(): Promise<Formula[]> {
    return Array.from(this.formulas.values());
  }

  async getFormula(id: string): Promise<Formula | undefined> {
    return this.formulas.get(id);
  }

  async createFormula(insertFormula: InsertFormula): Promise<Formula> {
    const id = randomUUID();
    const formula: Formula = { ...insertFormula, id };
    this.formulas.set(id, formula);
    return formula;
  }

  async updateFormula(id: string, insertFormula: InsertFormula): Promise<Formula | undefined> {
    if (!this.formulas.has(id)) return undefined;
    const formula: Formula = { ...insertFormula, id };
    this.formulas.set(id, formula);
    return formula;
  }

  async deleteFormula(id: string): Promise<boolean> {
    return this.formulas.delete(id);
  }

  // Constant operations
  async getConstants(): Promise<Constant[]> {
    return Array.from(this.constants.values());
  }

  async getConstant(id: string): Promise<Constant | undefined> {
    return this.constants.get(id);
  }

  async createConstant(insertConstant: InsertConstant): Promise<Constant> {
    const id = randomUUID();
    const constant: Constant = { ...insertConstant, id };
    this.constants.set(id, constant);
    return constant;
  }

  async updateConstant(id: string, insertConstant: InsertConstant): Promise<Constant | undefined> {
    if (!this.constants.has(id)) return undefined;
    const constant: Constant = { ...insertConstant, id };
    this.constants.set(id, constant);
    return constant;
  }

  async deleteConstant(id: string): Promise<boolean> {
    return this.constants.delete(id);
  }

  // Calculation operations
  async getCalculations(): Promise<Calculation[]> {
    return Array.from(this.calculations.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async createCalculation(insertCalculation: InsertCalculation): Promise<Calculation> {
    const id = randomUUID();
    const calculation: Calculation = { ...insertCalculation, id };
    this.calculations.set(id, calculation);
    return calculation;
  }

  async clearCalculations(): Promise<boolean> {
    this.calculations.clear();
    return true;
  }
}

export const storage = new MemStorage();
