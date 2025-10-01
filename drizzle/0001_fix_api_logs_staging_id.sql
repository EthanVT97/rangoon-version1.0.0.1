-- drizzle/0002_fix_api_logs_missing_columns.sql
-- Add missing columns to api_logs table

-- Check and add filename column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'filename'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN filename text NOT NULL DEFAULT 'unknown';
    -- Remove default after adding column
    ALTER TABLE api_logs ALTER COLUMN filename DROP DEFAULT;
  END IF;
END $$;

-- Check and add other potentially missing columns
DO $$ 
BEGIN
  -- Add staging_id if missing (your previous migration might have done this)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'staging_id'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN staging_id uuid;
  END IF;

  -- Add module if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'module'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN module text NOT NULL DEFAULT 'Unknown';
    ALTER TABLE api_logs ALTER COLUMN module DROP DEFAULT;
  END IF;

  -- Add endpoint if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'endpoint'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN endpoint text NOT NULL DEFAULT '/api/unknown';
    ALTER TABLE api_logs ALTER COLUMN endpoint DROP DEFAULT;
  END IF;

  -- Add method if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'method'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN method text NOT NULL DEFAULT 'POST';
    ALTER TABLE api_logs ALTER COLUMN method DROP DEFAULT;
  END IF;

  -- Add record_count if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'record_count'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN record_count integer NOT NULL DEFAULT 0;
    ALTER TABLE api_logs ALTER COLUMN record_count DROP DEFAULT;
  END IF;

  -- Add success_count if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'success_count'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN success_count integer NOT NULL DEFAULT 0;
    ALTER TABLE api_logs ALTER COLUMN success_count DROP DEFAULT;
  END IF;

  -- Add failure_count if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'failure_count'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN failure_count integer NOT NULL DEFAULT 0;
    ALTER TABLE api_logs ALTER COLUMN failure_count DROP DEFAULT;
  END IF;

  -- Add status if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'status'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN status text NOT NULL DEFAULT 'pending';
    ALTER TABLE api_logs ALTER COLUMN status DROP DEFAULT;
  END IF;

  -- Add erpnext_response if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'erpnext_response'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN erpnext_response jsonb;
  END IF;

  -- Add errors if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'errors'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN errors jsonb;
  END IF;

  -- Add response_time if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'response_time'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN response_time integer NOT NULL DEFAULT 0;
    ALTER TABLE api_logs ALTER COLUMN response_time DROP DEFAULT;
  END IF;

  -- Add created_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'api_logs' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE api_logs ADD COLUMN created_at timestamp NOT NULL DEFAULT NOW();
  END IF;

END $$;

-- Create index on staging_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_api_logs_staging_id ON api_logs(staging_id);

-- Create index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON api_logs(status);
