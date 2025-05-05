import bcrypt from 'bcryptjs';
import logger from './logger';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import path from 'path';

interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
}

class StorageManager {
  private static instance: StorageManager;
  private users: User[] = [];

  private constructor() {
    // Initialize with a test user
    this.createUser(
      'test@example.com',
      'password123',
      'Test',
      'User'
    ).catch(console.error);
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  public async createUser(email: string, password: string, firstName: string, lastName: string): Promise<User> {
    try {
      const existingUser = this.users.find(user => user.email === email);
      if (existingUser) {
        throw new Error('Email already in use');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser: User = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        createdAt: new Date()
      };

      this.users.push(newUser);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = this.users.find(user => user.email === email);
      return user || null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  public async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.findUserByEmail(email);
      if (!user) return false;
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  }

  public async updateUser(email: string, updates: Partial<User>): Promise<User | null> {
    try {
      const userIndex = this.users.findIndex(user => user.email === email);
      if (userIndex === -1) return null;

      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      this.users[userIndex] = {
        ...this.users[userIndex],
        ...updates
      };

      return this.users[userIndex];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
}

export const storageManager = StorageManager.getInstance(); 