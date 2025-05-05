/*
  # Controller System Schema

  1. New Tables
    - controllers: Controller information
    - controller_assignments: Daily site assignments
    - controller_visits: Site visit records
    - agent_evaluations: Agent performance evaluations
    - explanation_requests: Agent explanation requests

  2. Features
    - Controller profiles and assignments
    - Visit tracking with GPS
    - Agent evaluations with ratings
    - Explanation request management
*/

-- Create custom types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evaluation_status') THEN
    CREATE TYPE evaluation_status AS ENUM ('pending', 'in_progress', 'closed');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evaluation_rating') THEN
    CREATE TYPE evaluation_rating AS ENUM ('excellent', 'good', 'average', 'poor', 'critical');
  END IF;
END $$;

-- Create controllers table
CREATE TABLE IF NOT EXISTS controllers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  employee_number text NOT NULL UNIQUE,
  area text,
  phone_number text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create controller assignments table
CREATE TABLE IF NOT EXISTS controller_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL DEFAULT CURRENT_DATE,
  controller_id uuid REFERENCES controllers(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create controller visits table
CREATE TABLE IF NOT EXISTS controller_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES controller_assignments(id) ON DELETE CASCADE,
  arrival_time timestamptz NOT NULL,
  departure_time timestamptz,
  overall_rating evaluation_rating,
  observations text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agent evaluations table
CREATE TABLE IF NOT EXISTS agent_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid REFERENCES controller_visits(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  punctuality boolean NOT NULL,
  cleanliness boolean NOT NULL,
  posture boolean NOT NULL,
  compliance_instructions boolean NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create explanation requests table
CREATE TABLE IF NOT EXISTS explanation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id uuid REFERENCES controller_visits(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  reason text NOT NULL,
  comment text,
  status evaluation_status DEFAULT 'pending',
  responsible_pc uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_controller_assignments_controller ON controller_assignments(controller_id);
CREATE INDEX IF NOT EXISTS idx_controller_assignments_date ON controller_assignments(date);
CREATE INDEX IF NOT EXISTS idx_controller_visits_assignment ON controller_visits(assignment_id);
CREATE INDEX IF NOT EXISTS idx_agent_evaluations_visit ON agent_evaluations(visit_id);
CREATE INDEX IF NOT EXISTS idx_explanation_requests_status ON explanation_requests(status);

-- Enable RLS
ALTER TABLE controllers ENABLE ROW LEVEL SECURITY;
ALTER TABLE controller_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE controller_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE explanation_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for controllers
CREATE POLICY "Controllers can view own data"
  ON controllers FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  );

CREATE POLICY "PC can manage all data"
  ON controllers FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  );

-- Create policies for assignments
CREATE POLICY "Controllers can view own assignments"
  ON controller_assignments FOR SELECT TO authenticated
  USING (
    controller_id IN (
      SELECT id FROM controllers WHERE user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  );

CREATE POLICY "PC can manage all assignments"
  ON controller_assignments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  );

-- Create policies for visits
CREATE POLICY "Controllers can create visits"
  ON controller_visits FOR INSERT TO authenticated
  WITH CHECK (
    assignment_id IN (
      SELECT ca.id FROM controller_assignments ca
      JOIN controllers c ON ca.controller_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Controllers can view own visits"
  ON controller_visits FOR SELECT TO authenticated
  USING (
    assignment_id IN (
      SELECT ca.id FROM controller_assignments ca
      JOIN controllers c ON ca.controller_id = c.id
      WHERE c.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  );

CREATE POLICY "PC can manage all visits"
  ON controller_visits FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  );

-- Create policies for evaluations
CREATE POLICY "Controllers can create evaluations"
  ON agent_evaluations FOR INSERT TO authenticated
  WITH CHECK (
    visit_id IN (
      SELECT cv.id FROM controller_visits cv
      JOIN controller_assignments ca ON cv.assignment_id = ca.id
      JOIN controllers c ON ca.controller_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Controllers can view own evaluations"
  ON agent_evaluations FOR SELECT TO authenticated
  USING (
    visit_id IN (
      SELECT cv.id FROM controller_visits cv
      JOIN controller_assignments ca ON cv.assignment_id = ca.id
      JOIN controllers c ON ca.controller_id = c.id
      WHERE c.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  );

CREATE POLICY "PC can manage all evaluations"
  ON agent_evaluations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  );

-- Create policies for explanation requests
CREATE POLICY "Controllers can create requests"
  ON explanation_requests FOR INSERT TO authenticated
  WITH CHECK (
    visit_id IN (
      SELECT cv.id FROM controller_visits cv
      JOIN controller_assignments ca ON cv.assignment_id = ca.id
      JOIN controllers c ON ca.controller_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

CREATE POLICY "Controllers can view own requests"
  ON explanation_requests FOR SELECT TO authenticated
  USING (
    visit_id IN (
      SELECT cv.id FROM controller_visits cv
      JOIN controller_assignments ca ON cv.assignment_id = ca.id
      JOIN controllers c ON ca.controller_id = c.id
      WHERE c.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  );

CREATE POLICY "PC can manage all requests"
  ON explanation_requests FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'pc'
    )
  );