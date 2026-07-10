import fm from 'front-matter';

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

export const getAllPosts = (): PostData[] => {
  return Object.values(markdownModules).map((markdownContent) => {
    // 使用专为前端设计的 front-matter 库
    const { attributes: data, body: content } = fm(markdownContent as string);
    const attributes = data as PostMetadata;
    
    attributes.hasCustomImage = !!attributes.image;
    attributes.imageUrl = attributes.image;
    attributes.url = `/post/${attributes.id}`;
    
    return {
      attributes,
      body: content
    };
  });
};

export const getPostById = (id: string): PostData | undefined => {
  const posts = getAllPosts();
  return posts.find(post => post.attributes.id === id);
};
