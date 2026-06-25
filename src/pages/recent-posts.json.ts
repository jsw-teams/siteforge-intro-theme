import blogPosts from '../data/blog-posts.json';

export function GET() {
  return new Response(JSON.stringify(blogPosts), {
    headers: {
      'cache-control': 'public, max-age=300',
      'content-type': 'application/json; charset=utf-8'
    }
  });
}
