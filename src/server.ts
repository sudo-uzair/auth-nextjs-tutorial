import express from 'express';
import next from 'next';
import http from 'http';
import { Server } from 'socket.io';

const port = 5000;
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const adminSockets = new Map<string, string>(); 
const clientSockets = new Map<string, string>(); 
const userSockets = new Map<string, string>(); // Map to store user email to socket ID

nextApp.prepare().then(() => {
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });
    io.on('connection', (socket) => {
      socket.on('admin:auth', (adminEmail: string, adminId: string) => {
        if (adminId) {
            adminSockets.set(socket.id, adminEmail);
            userSockets.set(adminId, socket.id); // Use user ID as key
            console.log(' Admin authenticated:', adminEmail, adminId);
        }
      });

      socket.on('client:auth', (clientEmail: string, clientId: string) => {
        if (clientId) {
            clientSockets.set(socket.id, clientEmail);
            userSockets.set(clientId, socket.id); // Use user ID as key
            console.log(' Client authenticated:', clientEmail, clientId);
        }
      });

      socket.on('chat:message', (data: { content: string, receiverId: string, senderId: string, id: string }) => {
        console.log(` New message from ${data.senderId} to ${data.receiverId}: ${data.content}`);
        const receiverSocketId = userSockets.get(data.receiverId);
        
        if (receiverSocketId) {
            // Send the message to the receiver
            io.to(receiverSocketId).emit('chat:message', {
                id: data.id,
                content: data.content,
                senderId: data.senderId,
                receiverId: data.receiverId,
 
            });

            // Send notification to the receiver
            io.to(receiverSocketId).emit('notification:new_message', {
                type: 'new_message',
                message: `You have a new message`,
                content: data.content,
                senderId: data.senderId,
      
            });
        }
      });

      socket.on('project:created', (project) => {
        // when a new project is created by client, notify admin
        adminSockets.forEach((email, adminSocketId) => {
            io.to(adminSocketId).emit('notification:new_project', {
                type: 'new_project',
                message: `New project "${project.name}" created by ${project.clientName}`,
                project,
          
            });
        });
      });

      socket.on('project:updated', (project) => {
        console.log(`🔄 Project updated: ${project.name} for ${project.clientemail}`);
        // Notify the client who owns the project
        clientSockets.forEach((clientEmail, clientSocketId) => {
            if (clientEmail === project.clientemail) {
                console.log(`Checking ${clientEmail} against ${project.clientemail}`);
                io.to(clientSocketId).emit('notification:project_updated', {
                    type: 'project_updated',
                    message: `Your project "${project.name}" has been updated by admin`,
                    project,
                    timestamp: new Date().toISOString()
                });
            }
            else {
                console.log(`Skipping ${clientEmail} for project ${project.name}`);
            }
        });
      });

      socket.on('project:deleted', (project) => {
        console.log(`Project deleted: ${project.name} for ${project.clientemail}`);
        
        clientSockets.forEach((clientEmail, clientSocketId) => {
            if (clientEmail === project.clientemail) {
                console.log(`📢 Sending delete notification to ${clientEmail}`);
                io.to(clientSocketId).emit('notification:project_deleted', {
                    type: 'project_deleted',
                    message: `Your project "${project.name}" has been deleted`,
                    project,
                    timestamp: new Date().toISOString()
                });
            }
        });
      });

      socket.on('disconnect', () => {
        const userEmail = adminSockets.get(socket.id) || clientSockets.get(socket.id);
        if (userEmail) {
            userSockets.delete(userEmail);
        }
        adminSockets.delete(socket.id);
        clientSockets.delete(socket.id);
        console.log('❌ Client disconnected:', socket.id);
      });
    });

    app.use((req, res) => {
        return handle(req, res);
    });

    server.listen(port, () => {
        console.log(`🚀 Server ready on http://localhost:${port}`);
    });
}).catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
});
