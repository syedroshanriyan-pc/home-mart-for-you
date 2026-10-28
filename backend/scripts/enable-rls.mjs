import { PrismaClient } from "@prisma/client";

// Use DIRECT_URL (session connection, port 5432) for DDL / RLS migration
const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

async function main() {
  console.log("Connecting to Supabase PostgreSQL database via DIRECT_URL...");

  // Query all public tables in PostgreSQL
  const tables = await prisma.$queryRawUnsafe(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma_%';
  `);

  console.log(`Found ${tables.length} tables in public schema:`);
  for (const t of tables) {
    const table = t.tablename;
    console.log(`- Enabling RLS on "${table}"...`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
    
    // Ensure service_role/postgres has explicit full access policy if not already present
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE schemaname = 'public' 
            AND tablename = '${table}' 
            AND policyname = 'service_role_full_access'
        ) THEN
          CREATE POLICY "service_role_full_access" 
          ON "${table}" 
          FOR ALL 
          USING (true) 
          WITH CHECK (true);
        END IF;
      END $$;
    `);
  }

  console.log("\n✅ Row Level Security (RLS) successfully enabled on all Supabase public tables!");
}

main()
  .catch((err) => {
    console.error("❌ Error enabling RLS:", err.message || err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
