'use client';

import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

type ArticleVideoPlayerProps = {
  url: string;
  title: string;
};

export function ArticleVideoPlayer({ url, title }: ArticleVideoPlayerProps) {
  return (
    <div className="article-video-player">
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        className="article-video-player__react"
        config={{
          youtube: { playerVars: { rel: 0 } },
        }}
        aria-label={title}
      />
    </div>
  );
}
