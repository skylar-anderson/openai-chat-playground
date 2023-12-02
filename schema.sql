-- RUN 3rd after running the scripts
create or replace function repository_search (
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int,
  query_handle text
)
returns table (
  id bigint,
  title text,
  sha text,
  repo text,
  owner text,
  chunk text,
  content text,
  ref text,
  path text,
  handle text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    search_index.id,
    search_index.title,
    search_index.sha,
    search_index.repo,
    search_index.owner,
    search_index.chunk,
    search_index.content,
    search_index.ref,
    search_index.path,
    search_index.handle,
    1 - (search_index.embedding <=> query_embedding) as similarity
  from search_index
  where search_index.handle = query_handle
      AND 1 - (search_index.embedding <=> query_embedding) > similarity_threshold
  order by search_index.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- RUN 4th
create index on search_index 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
