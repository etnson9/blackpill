-- 1. Create Profiles Table (to store public user data)
-- This table will be linked to the auth.users table.
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'user' NOT-NULL,
  badge TEXT DEFAULT 'Initiate' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Create Categories Table
CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories." ON public.categories FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 3. Create Posts Table
CREATE TABLE public.posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category_id INTEGER REFERENCES public.categories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  nsfw BOOLEAN DEFAULT false,
  anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable by everyone." ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts." ON public.posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own posts." ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts." ON public.posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all posts." ON public.posts FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );


-- 4. Create Comments Table
CREATE TABLE public.comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for Comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments." ON public.comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their own comments." ON public.comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all comments." ON public.comments FOR ALL USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );


-- 5. Create Votes Table
CREATE TABLE public.votes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL, -- 'up' or 'down'
  UNIQUE(post_id, user_id) -- Ensures a user can only vote once per post
);

-- RLS Policy for Votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Votes are viewable by everyone." ON public.votes FOR SELECT USING (true);
CREATE POLICY "Users can cast votes." ON public.votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change or remove their vote." ON public.votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their votes." ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- 6. Enable Real-time for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts, public.comments;

-- 7. Seed Initial Data (Categories)
INSERT INTO public.categories (name, description) VALUES
('CONFIDENCE', 'Build mental fortitude and social dominance'),
('FITNESS', 'Workouts, nutrition, and physique optimization'),
('STYLE', 'Fashion, grooming, and appearance improvement'),
('MINDFULNESS', 'Mental clarity, meditation, and focus'),
('TECH', 'Gadgets, software, and tech trends'),
('HOBBIES', 'Skills, interests, and leisure activities'),
('NEWS', 'Current events and analysis'),
('OFF-TOPIC', 'Random discussions'),
('PEPTIDES & SARMS', 'Body optimization, hormones, supplements'),
('BONE STRUCTURE / FACE SHAPE', 'Facial aesthetics, jawline, symmetry'),
('SELF-OPTIMIZATION', 'Maximizing potential in all areas'),
('ANON DISCUSSIONS', 'Completely anonymous posts');