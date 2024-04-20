'use server';
//import { User } from './../models/User';
import { auth } from '@/auth';

import clientPromise from '@/lib/mongodb';
import mongoose from 'mongoose';

export const getUserByEmail = async (email: string) => {
  try {
    const client = await clientPromise;
    const db = client.db(); // Use your database name

    // Assuming you have an "invoices" collection
    //const invoicesCollection = db.collection('users');
    const user = await db.collection('users').findOne({ email: email });
    console.log('USER FOUND IS: ', user);

    const parsedUser = JSON.parse(JSON.stringify(user));
    //return user;
    return parsedUser;
  } catch {
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const client = await clientPromise;
    const db = client.db(); // Use your database name
    const uid = new mongoose.Types.ObjectId(id);
    const user = await db.collection('users').findOne({ _id: uid });

    return user;
  } catch {
    return null;
  }
};
