import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFormulaSchema, insertConstantSchema, insertCalculationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Formula routes
  app.get("/api/formulas", async (req, res) => {
    try {
      const formulas = await storage.getFormulas();
      res.json(formulas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch formulas" });
    }
  });

  app.get("/api/formulas/:id", async (req, res) => {
    try {
      const formula = await storage.getFormula(req.params.id);
      if (!formula) {
        return res.status(404).json({ error: "Formula not found" });
      }
      res.json(formula);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch formula" });
    }
  });

  app.post("/api/formulas", async (req, res) => {
    try {
      const result = insertFormulaSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid formula data", details: result.error.errors });
      }
      
      const formula = await storage.createFormula(result.data);
      res.status(201).json(formula);
    } catch (error) {
      res.status(500).json({ error: "Failed to create formula" });
    }
  });

  app.put("/api/formulas/:id", async (req, res) => {
    try {
      const result = insertFormulaSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid formula data", details: result.error.errors });
      }
      
      const formula = await storage.updateFormula(req.params.id, result.data);
      if (!formula) {
        return res.status(404).json({ error: "Formula not found" });
      }
      res.json(formula);
    } catch (error) {
      res.status(500).json({ error: "Failed to update formula" });
    }
  });

  app.delete("/api/formulas/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFormula(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Formula not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete formula" });
    }
  });

  // Constants routes
  app.get("/api/constants", async (req, res) => {
    try {
      const constants = await storage.getConstants();
      res.json(constants);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch constants" });
    }
  });

  app.get("/api/constants/:id", async (req, res) => {
    try {
      const constant = await storage.getConstant(req.params.id);
      if (!constant) {
        return res.status(404).json({ error: "Constant not found" });
      }
      res.json(constant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch constant" });
    }
  });

  app.post("/api/constants", async (req, res) => {
    try {
      const result = insertConstantSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid constant data", details: result.error.errors });
      }
      
      const constant = await storage.createConstant(result.data);
      res.status(201).json(constant);
    } catch (error) {
      res.status(500).json({ error: "Failed to create constant" });
    }
  });

  app.put("/api/constants/:id", async (req, res) => {
    try {
      const result = insertConstantSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid constant data", details: result.error.errors });
      }
      
      const constant = await storage.updateConstant(req.params.id, result.data);
      if (!constant) {
        return res.status(404).json({ error: "Constant not found" });
      }
      res.json(constant);
    } catch (error) {
      res.status(500).json({ error: "Failed to update constant" });
    }
  });

  app.delete("/api/constants/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteConstant(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Constant not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete constant" });
    }
  });

  // Calculation routes
  app.get("/api/calculations", async (req, res) => {
    try {
      const calculations = await storage.getCalculations();
      res.json(calculations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calculations" });
    }
  });

  app.post("/api/calculations", async (req, res) => {
    try {
      const result = insertCalculationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid calculation data", details: result.error.errors });
      }
      
      const calculation = await storage.createCalculation(result.data);
      res.status(201).json(calculation);
    } catch (error) {
      res.status(500).json({ error: "Failed to save calculation" });
    }
  });

  app.delete("/api/calculations", async (req, res) => {
    try {
      await storage.clearCalculations();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear calculations" });
    }
  });

  // Calculate endpoint that performs calculation and saves to history
  const calculateSchema = z.object({
    formulaId: z.string(),
    inputs: z.record(z.string(), z.number()),
  });

  app.post("/api/calculate", async (req, res) => {
    try {
      const result = calculateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid calculation request", details: result.error.errors });
      }

      const { formulaId, inputs } = result.data;
      
      // Get the formula
      const formula = await storage.getFormula(formulaId);
      if (!formula) {
        return res.status(404).json({ error: "Formula not found" });
      }

      // Evaluate the formula using mathjs
      const { evaluate } = await import('mathjs');
      const calculatedResult = evaluate(formula.formula, inputs);

      // Save calculation to history
      const calculation = await storage.createCalculation({
        formulaId,
        inputs: JSON.stringify(inputs),
        result: calculatedResult,
        timestamp: new Date().toISOString(),
      });

      res.json({
        result: calculatedResult,
        calculation,
        formula
      });
    } catch (error) {
      res.status(500).json({ error: "Calculation failed", details: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
