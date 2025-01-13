const { Command } = require('commander');
const chalk = require('chalk');
const execa = require('execa');
const ora = require('ora');
const prompts = require('prompts');
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

// Cross-platform command helpers
const isWindows = os.platform() === 'win32';
const is64Bit = os.arch() === 'x64';

// Windows-specific paths
const programFiles = is64Bit ? 'C:\\Program Files' : 'C:\\Program Files (x86)';
const rmrf = isWindows ? ['cmd', ['/c', 'rmdir', '/s', '/q']] : ['rm', ['-rf']];
const gitInit = isWindows ? ['cmd', ['/c', 'git', 'init']] : ['git', ['init']];

const program = new Command()
  .name('create-titan')
  .description('Create a new Titan project')
  .argument('[directory]', 'Directory to create the project in')
  .version('0.1.0')
  .parse();

async function main() {
  const projectDir = program.args[0] || '.';
  let spinner;

  try {
    // Project setup questions
    const { projectName, projectDescription, githubRepo } = await prompts([
      {
        type: 'text',
        name: 'projectName',
        message: 'What is your project name?',
        initial: path.basename(path.resolve(projectDir)),
      },
      {
        type: 'text',
        name: 'projectDescription',
        message: 'Describe your project in a few words:',
      },
      {
        type: 'text',
        name: 'githubRepo',
        message: 'Enter your GitHub repository URL:',
        validate: (value: string) => value.includes('github.com') ? true : 'Please enter a valid GitHub repository URL'
      },
    ], {
      onCancel: () => {
        console.log('\nSetup cancelled');
        process.exit(1);
      }
    });

    spinner = ora('Creating your Titan project...').start();

    // Clone the repository
    await execa('git', [
      'clone',
      'https://github.com/ObaidUr-Rahmaan/titan.git',
      projectDir,
    ]);

    // Remove git history
    await execa(...rmrf, [path.join(projectDir, '.git')]);
    
    // Initialize new git repository
    await execa(...gitInit, { cwd: projectDir });

    spinner.succeed('Project cloned successfully!');

    let envContent = '';
    
    // Auth Configuration
    spinner.stop();
    const authConfig = await prompts([
      {
        type: 'password',
        name: 'clerkPublishableKey',
        message: 'Enter your Clerk Publishable Key:',
      },
      {
        type: 'password',
        name: 'clerkSecretKey',
        message: 'Enter your Clerk Secret Key:',
      },
    ], {
      onCancel: () => {
        console.log('\nSetup cancelled');
        process.exit(1);
      }
    });

    if (!authConfig.clerkPublishableKey || !authConfig.clerkSecretKey) {
      console.log(chalk.red('Clerk keys are required'));
      process.exit(1);
    }

    spinner.start('Configuring authentication...');
    envContent += `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${authConfig.clerkPublishableKey}\n`;
    envContent += `CLERK_SECRET_KEY=${authConfig.clerkSecretKey}\n\n`;
    envContent += `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in\n`;
    envContent += `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up\n`;
    envContent += `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/\n`;
    envContent += `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/\n\n`;
    spinner.succeed('Authentication configured');

    // Database Configuration
    spinner.stop();
    const dbMode = await prompts([
      {
        type: 'select',
        name: 'mode',
        message: 'Choose database mode:',
        choices: [
          { title: 'Local Development', value: 'local' },
          { title: 'Production', value: 'production' }
        ]
      }
    ], {
      onCancel: () => {
        console.log('\nSetup cancelled');
        process.exit(1);
      }
    });

    let dbConfig;
    if (dbMode.mode === 'local') {
      spinner.start('Setting up local Supabase...');
      try {
        await execa('supabase', ['init'], { cwd: projectDir });
        spinner.succeed('Supabase initialized');
        
        spinner.start('Starting Supabase (this might take a few minutes on first run)...');
        const { stdout } = await execa('supabase', ['start'], { cwd: projectDir });
        spinner.succeed('Supabase started');
        
        // Parse the service_role key from stdout
        const serviceKeyMatch = stdout.match(/service_role key: (.*)/);
        if (!serviceKeyMatch) {
          throw new Error('Could not find service_role key in Supabase output');
        }
        
        const serviceKey = serviceKeyMatch[1].trim();
        
        dbConfig = {
          supabaseUrl: 'http://127.0.0.1:54321',
          supabaseServiceKey: serviceKey,
          databaseUrl: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
          directUrl: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
        };

        // Generate and apply Supabase migrations from Prisma schema
        spinner.start('Syncing database schema...');
        try {
          // Generate migration from current state to match Prisma schema
          await execa('supabase', ['db', 'diff', '-f', 'init'], { cwd: projectDir });
          // Apply the migration
          await execa('supabase', ['db', 'reset'], { cwd: projectDir });
          spinner.succeed('Database schema synced with Prisma schema');
        } catch (error) {
          spinner.warn('Failed to sync database schema automatically. Will try with Prisma instead.');
          console.error(chalk.yellow('Supabase migration error:'), error);
        }
        
        console.log(chalk.green('\nCheck Docker/Orbstack. Your local Supabase instance is running! 🚀'));
      } catch (error) {
        spinner.fail('Failed to setup local Supabase');
        console.error(chalk.red('Error:'), error);
        console.log(chalk.yellow('\nMake sure you have Docker running and try again.'));
        process.exit(1);
      }
    } else {
      dbConfig = await prompts([
        {
          type: 'text',
          name: 'supabaseUrl',
          message: 'Enter your Supabase URL:',
        },
        {
          type: 'password',
          name: 'supabaseServiceKey',
          message: 'Enter your Supabase Service Key:',
        },
        {
          type: 'text',
          name: 'databaseUrl',
          message: 'Enter your Database URL (with pgbouncer):',
        },
        {
          type: 'text',
          name: 'directUrl',
          message: 'Enter your Direct URL:',
        },
      ], {
        onCancel: () => {
          console.log('\nSetup cancelled');
          process.exit(1);
        }
      });
    }

    if (!dbConfig.supabaseUrl || !dbConfig.supabaseServiceKey || !dbConfig.databaseUrl || !dbConfig.directUrl) {
      console.log(chalk.red('All database configuration values are required'));
      process.exit(1);
    }

    spinner.start('Configuring database...');
    envContent += `SUPABASE_URL=${dbConfig.supabaseUrl}\n`;
    envContent += `SUPABASE_SERVICE_KEY=${dbConfig.supabaseServiceKey}\n\n`;
    envContent += `DATABASE_URL="${dbConfig.databaseUrl}"\n`;
    envContent += `DIRECT_URL="${dbConfig.directUrl}"\n\n`;
    envContent += `FRONTEND_URL=http://localhost:3000\n\n`;
    spinner.succeed('Database configured');

    // Payments Configuration
    spinner.stop();
    const paymentConfig = await prompts([
      {
        type: 'text',
        name: 'stripePublicKey',
        message: 'Enter your Stripe Public Key:',
      },
      {
        type: 'password',
        name: 'stripeSecretKey',
        message: 'Enter your Stripe Secret Key:',
      },
      {
        type: 'text',
        name: 'stripePriceId',
        message: 'Enter your Stripe Price ID:',
      },
    ], {
      onCancel: () => {
        console.log('\nSetup cancelled');
        process.exit(1);
      }
    });

    if (!paymentConfig.stripeSecretKey || !paymentConfig.stripePublicKey || !paymentConfig.stripePriceId) {
      console.log(chalk.red('All Stripe configuration values are required'));
      process.exit(1);
    }

    spinner.start('Configuring payments...');
    envContent += `STRIPE_SECRET_KEY=${paymentConfig.stripeSecretKey}\n`;
    envContent += `NEXT_PUBLIC_STRIPE_PUBLIC_KEY=${paymentConfig.stripePublicKey}\n`;
    envContent += `NEXT_PUBLIC_STRIPE_PRICE_ID=${paymentConfig.stripePriceId}\n\n`;
    spinner.succeed('Payments configured');

    // Email Configuration
    spinner.stop();
    const emailConfig = await prompts([
      {
        type: 'text',
        name: 'plunkApiKey',
        message: 'Enter your Plunk API Key:',
      },
    ], {
      onCancel: () => {
        console.log('\nSetup cancelled');
        process.exit(1);
      }
    });

    if (!emailConfig.plunkApiKey) {
      console.log(chalk.red('Plunk API Key is required'));
      process.exit(1);
    }

    spinner.start('Configuring email...');
    envContent += `PLUNK_API_KEY=${emailConfig.plunkApiKey}\n`;
    spinner.succeed('Email configured');

    // Write configuration files
    spinner.start('Writing configuration files...');
    await fs.writeFile(path.join(projectDir, '.env'), envContent);
    await fs.rm(path.join(projectDir, '.env.template'));

    // Update config.ts
    const configPath = path.join(projectDir, 'config.ts');
    const configContent = `const config = {
  auth: {
    enabled: true,
  },
  payments: {
    enabled: true,
  },
  email: {
    enabled: true,
  },
};

export default config;
`;
    await fs.writeFile(configPath, configContent);

    // Run initial database migration
    spinner.start('Setting up database tables...');
    try {
      await execa('pnpm', ['dlx', 'prisma', 'generate'], { cwd: projectDir });
      await execa('pnpm', ['dlx', 'prisma', 'db', 'push'], { cwd: projectDir });
      spinner.succeed('Database tables created successfully');
    } catch (error) {
      spinner.fail('Failed to create database tables');
      console.error(chalk.red('Error running database migrations:'), error);
      console.log(chalk.yellow('\nYou can try running the migrations manually:'));
      console.log(chalk.cyan('  cd ' + projectDir));
      console.log(chalk.cyan('  pnpm prisma generate'));
      console.log(chalk.cyan('  pnpm prisma migrate deploy'));
    }

    spinner.succeed(chalk.green('Project configured successfully! 🚀'));
    
    // Change into project directory and install dependencies
    spinner.start('Installing dependencies...');
    try {
      process.chdir(path.resolve(projectDir));
      await execa('pnpm', ['install'], { stdio: 'inherit' });
      spinner.succeed('Dependencies installed');
    } catch (error) {
      spinner.fail('Failed to install dependencies');
      console.error(chalk.red('Error installing dependencies:'), error);
      process.exit(1);
    }

    spinner.start('Setting up git repository...');
    await execa('git', ['remote', 'add', 'origin', githubRepo]);
    await execa('git', ['add', '.']);
    await execa('git', ['commit', '-m', 'Initial commit from Titan CLI']);
    await execa('git', ['branch', '-M', 'main']);
    await execa('git', ['push', '-u', 'origin', 'main']);
    spinner.succeed('Git repository setup complete');

    // Update README
    const readmeContent = `# ${projectName}

${projectDescription}

# ToDos

- Add todos here...
`;
    await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent);

    // Delete packages folder
    try {
      await fs.rm(path.join(projectDir, 'packages'), { recursive: true, force: true });
    } catch (error) {
      // Silently continue if folder doesn't exist or can't be deleted
    }

    // Open in editor (try both code and cursor)
    spinner.start('Opening project in editor...');
    try {
      const editor = isWindows 
        ? path.join(programFiles, 'Microsoft VS Code', 'bin', 'code.cmd')
        : 'code';
      await execa(editor, ['-r', '.']);
      spinner.succeed('Project opened in editor');
    } catch (error) {
      try {
        // Fallback to PATH-based code command
        await execa(isWindows ? 'code.cmd' : 'code', ['-r', '.']);
        spinner.succeed('Project opened in editor');
      } catch (fallbackError) {
        spinner.warn('Could not open project in editor. Please open it manually.');
      }
    }
    
    console.log('\nMake sure to:');
    console.log('1. Review your .env file');
    console.log('2. Start the development server with: pnpm dev');
    console.log('3. Check the documentation at https://github.com/ObaidUr-Rahmaan/titan');
    
  } catch (error) {
    if (spinner) {
      spinner.stop();
    }
    console.error(chalk.red('Failed to create project:'), error);
    process.exit(1);
  }
}

// Handle interrupts
process.on('SIGINT', () => {
  console.log('\nSetup cancelled');
  process.exit(1);
});

main().catch((error) => {
  console.error(error);
  process.exit(1);
}); 