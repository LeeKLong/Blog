export interface PostMetadata {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  date: string;
  status: string;
  image: string;
  excerpt: string;
  hasCustomImage?: boolean;
  imageUrl?: string;
  url?: string;
}

export interface PostData {
  attributes: PostMetadata;
  body: string;
}

const markdownModules = import.meta.glob('../content/*.md', { query: '?raw', import: 'default', eager: true });

function parseFrontmatter(mdContent: string) {
  const match = mdContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { attributes: {} as Partial<PostMetadata>, body: mdContent };

  const yamlStr = match[1];
  const body = match[2];
  const attributes: Record<string, string> = {};

  yamlStr.split(/\r?\n/).forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      attributes[key] = value;
    }
  });

  return { attributes: attributes as unknown as PostMetadata, body };
}

export const getAllPosts = (): PostData[] => {
  return Object.values(markdownModules).map((markdownContent) => {
    const parsed = parseFrontmatter(markdownContent as string);
    const attributes = parsed.attributes;
    
    attributes.hasCustomImage = !!attributes.image;
    attributes.imageUrl = attributes.image;
    attributes.url = `/post/${attributes.id}`;
    
    return {
      attributes,
      body: parsed.body
    };
  });
};

export const getPostById = (id: string): PostData | undefined => {
  const posts = getAllPosts();
  return posts.find(post => post.attributes.id === id);
};
