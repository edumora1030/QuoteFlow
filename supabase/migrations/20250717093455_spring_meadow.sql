/*
  # Create quotations table

  1. New Tables
    - `quotations`
      - `id` (uuid, primary key)
      - `title` (text)
      - `client` (text)
      - `amount` (numeric)
      - `date` (date)
      - `status` (text, default 'pendiente')
      - `description` (text)
      - `purchase_order_created` (boolean, default false)
      - `invoice_generated` (boolean, default false)
      - `invoice_paid` (boolean, default false)
      - `purchase_order_file` (jsonb, nullable)
      - `invoice_file` (jsonb, nullable)
      - `created_by` (uuid, references users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `quotations` table
    - Add policies for authenticated users to manage quotations
*/

CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client text NOT NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  date date NOT NULL,
  status text DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'rechazada')),
  description text NOT NULL,
  purchase_order_created boolean DEFAULT false,
  invoice_generated boolean DEFAULT false,
  invoice_paid boolean DEFAULT false,
  purchase_order_file jsonb,
  invoice_file jsonb,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Users can read all quotations
CREATE POLICY "Users can read quotations"
  ON quotations
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can create quotations
CREATE POLICY "Users can create quotations"
  ON quotations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Users can update quotations they created, admins can update any
CREATE POLICY "Users can update own quotations"
  ON quotations
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Users can delete quotations they created, admins can delete any
CREATE POLICY "Users can delete own quotations"
  ON quotations
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();