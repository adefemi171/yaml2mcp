import * as child_process from 'child_process';
import * as path from 'path';
import { McpServerConfig, ServerStatus } from './types';

export class ProcessManager {
  private processes: Map<string, child_process.ChildProcess> = new Map();
  private serverStatuses: Map<string, ServerStatus> = new Map();

  startServer(config: McpServerConfig, onExit?: (name: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.processes.has(config.name)) {
        reject(new Error(`Server ${config.name} is already running`));
        return;
      }

      try {
        const options: child_process.SpawnOptions = {
          stdio: 'pipe',
          shell: false,
          ...(config.cwd && { cwd: path.resolve(config.cwd) }),
          ...(config.env && { env: { ...process.env, ...config.env } })
        };

        const args = config.args || [];
        const childProcess = child_process.spawn(config.command, args, options);

        const status: ServerStatus = {
          name: config.name,
          status: 'running',
          process: childProcess
        };
        this.serverStatuses.set(config.name, status);
        this.processes.set(config.name, childProcess);

        childProcess.on('error', (error) => {
          const errorStatus: ServerStatus = {
            name: config.name,
            status: 'error',
            error: error.message
          };
          this.serverStatuses.set(config.name, errorStatus);
          this.processes.delete(config.name);
          reject(error);
        });

        childProcess.on('exit', (code, signal) => {
          this.processes.delete(config.name);
          const currentStatus = this.serverStatuses.get(config.name);
          if (currentStatus) {
            currentStatus.status = 'stopped';
            currentStatus.process = undefined;
            if (code !== 0 && code !== null) {
              currentStatus.status = 'error';
              currentStatus.error = `Process exited with code ${code}`;
            }
          }
          if (onExit) {
            onExit(config.name);
          }
        });

        let stderr = '';
        childProcess.stderr?.on('data', (data) => {
          stderr += data.toString();
        });

        childProcess.stdout?.on('data', (data) => {
        });

        resolve();
      } catch (error: any) {
        const errorStatus: ServerStatus = {
          name: config.name,
          status: 'error',
          error: error.message
        };
        this.serverStatuses.set(config.name, errorStatus);
        reject(error);
      }
    });
  }

  stopServer(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const childProcess = this.processes.get(name);
      if (!childProcess) {
        const status = this.serverStatuses.get(name);
        if (status) {
          status.status = 'stopped';
        }
        resolve();
        return;
      }

      try {
        childProcess.kill('SIGTERM');

        const timeout = setTimeout(() => {
          if (this.processes.has(name)) {
            childProcess.kill('SIGKILL');
          }
        }, 5000);

        childProcess.once('exit', () => {
          clearTimeout(timeout);
          this.processes.delete(name);
          const status = this.serverStatuses.get(name);
          if (status) {
            status.status = 'stopped';
            status.process = undefined;
          }
          resolve();
        });
      } catch (error: any) {
        reject(new Error(`Failed to stop server ${name}: ${error.message}`));
      }
    });
  }

  getServerStatus(name: string): ServerStatus | undefined {
    return this.serverStatuses.get(name);
  }

  getAllStatuses(): ServerStatus[] {
    return Array.from(this.serverStatuses.values());
  }

  isRunning(name: string): boolean {
    return this.processes.has(name) && this.processes.get(name) !== undefined;
  }

  getRunningServers(): string[] {
    return Array.from(this.processes.keys());
  }

  async stopAll(): Promise<void> {
    const promises = Array.from(this.processes.keys()).map(name =>
      this.stopServer(name)
    );
    await Promise.all(promises);
  }

  initializeStatus(config: McpServerConfig): void {
    if (!this.serverStatuses.has(config.name)) {
      this.serverStatuses.set(config.name, {
        name: config.name,
        status: 'stopped'
      });
    }
  }
}
