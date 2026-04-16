import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/loggers';

export class ValidationMiddleware {
  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push(
        "Password must contain at least one special character (@$!%*?&)"
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate user registration data
  static validateUserRegistration() {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const { full_name, email, password, experience_level } = req.body;
        const errors: string[] = [];

        // Validate required fields
        if (!full_name || full_name.trim().length === 0) {
          errors.push("Full name is required");
        }

        if (!email) {
          errors.push("Email is required");
        } else if (!ValidationMiddleware.validateEmail(email)) {
          errors.push("Invalid email format");
        }

        if (!password) {
          errors.push("Password is required");
        } else {
          const passwordValidation =
            ValidationMiddleware.validatePassword(password);
          if (!passwordValidation.isValid) {
            errors.push(...passwordValidation.errors);
          }
        }

        // Validate experience level if provided
        if (experience_level) {
          const validLevels = [
            "beginner",
            "junior",
            "mid_level",
            "senior",
            "lead",
            "manager",
            "principal",
            "architect",
          ];
          if (!validLevels.includes(experience_level)) {
            errors.push(
              `Invalid experience level. Must be one of: ${validLevels.join(
                ", "
              )}`
            );
          }
        }

        if (errors.length > 0) {
          res.status(400).json({
            error: "Validation failed",
            details: errors,
          });
          return;
        }

        next();
      } catch (error) {
        logger.error("Validation error:", error);
        res.status(500).json({ error: "Validation failed" });
      }
    };
  }

  // Validate user login data
  static validateUserLogin() {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const { email, password } = req.body;
        const errors: string[] = [];

        if (!email) {
          errors.push("Email is required");
        } else if (!ValidationMiddleware.validateEmail(email)) {
          errors.push("Invalid email format");
        }

        if (!password) {
          errors.push("Password is required");
        }

        if (errors.length > 0) {
          res.status(400).json({
            error: "Validation failed",
            details: errors,
          });
          return;
        }

        next();
      } catch (error) {
        logger.error("Login validation error:", error);
        res.status(500).json({ error: "Validation failed" });
      }
    };
  }

  // Validate role assignment
  static validateRoleAssignment() {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const { roleType } = req.body;
        const errors: string[] = [];

        if (!roleType) {
          errors.push("Role type is required");
        } else {
          const validRoles = [
            "developer",
            "mentor",
            "moderator",
            "event_organizer",
            "content_creator",
            "admin",
            "super_admin",
          ];
          if (!validRoles.includes(roleType.toLowerCase())) {
            errors.push(
              `Invalid role type. Must be one of: ${validRoles.join(", ")}`
            );
          }
        }

        if (errors.length > 0) {
          res.status(400).json({
            error: "Validation failed",
            details: errors,
          });
          return;
        }

        next();
      } catch (error) {
        logger.error("Role validation error:", error);
        res.status(500).json({ error: "Validation failed" });
      }
    };
  }

  // Validate UUID parameters
  static validateUUID(paramName: string = "id") {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const id = req.params[paramName];

        if (!id) {
          res.status(400).json({ error: `${paramName} parameter is required` });
          return;
        }

        // Basic UUID format validation (36 characters with hyphens)
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          res.status(400).json({ error: `${paramName} must be a valid UUID` });
          return;
        }

        next();
      } catch (error) {
        logger.error("UUID validation error:", error);
        res.status(500).json({ error: "Validation failed" });
      }
    };
  }

  // Legacy method for backward compatibility (now validates UUID)
  static validateNumericId(paramName: string = "id") {
    return ValidationMiddleware.validateUUID(paramName);
  }

  // Sanitize input data
  static sanitizeInput() {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        // Trim string values in body
        if (req.body && typeof req.body === "object") {
          for (const key in req.body) {
            if (typeof req.body[key] === "string") {
              req.body[key] = req.body[key].trim();
            }
          }
        }

        next();
      } catch (error) {
        logger.error("Input sanitization error:", error);
        res.status(500).json({ error: "Input processing failed" });
      }
    };
  }
}
