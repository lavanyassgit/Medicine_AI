-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create medicines table for storing scanned medicine data
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_number TEXT,
  medicine_name TEXT NOT NULL,
  manufacturer TEXT,
  dosage TEXT,
  expiry_date DATE,
  quality_score INTEGER,
  scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_details JSONB,
  is_approved BOOLEAN DEFAULT false
);

-- Enable RLS on medicines
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;

-- Medicines policies
CREATE POLICY "Users can view their own medicines"
  ON public.medicines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medicines"
  ON public.medicines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create news_alerts table for fake medicine notifications
CREATE TABLE public.news_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT DEFAULT 'fake_medicine',
  severity TEXT DEFAULT 'medium'
);

-- Enable RLS on news_alerts
ALTER TABLE public.news_alerts ENABLE ROW LEVEL SECURITY;

-- News alerts policies (public read access)
CREATE POLICY "Anyone can view news alerts"
  ON public.news_alerts FOR SELECT
  USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Insert some sample news alerts
INSERT INTO public.news_alerts (title, description, source, severity) VALUES
  ('Counterfeit Paracetamol Detected in Delhi', 'Health authorities have identified fake paracetamol tablets in several Delhi pharmacies. Check batch numbers starting with PAR-2024.', 'Central Drugs Standard Control Organization', 'high'),
  ('Fake Antibiotic Alert - Mumbai Region', 'Counterfeit amoxicillin capsules reported. Verify authenticity before use.', 'FDA India', 'high'),
  ('Quality Standards Update', 'New guidelines for medicine verification released by CDSCO.', 'Ministry of Health', 'low');