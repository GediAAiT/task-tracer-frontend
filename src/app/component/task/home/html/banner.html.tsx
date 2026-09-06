import type { BannerVm } from '@/app/model/task/view/banner.vm';
import { FileIcon } from './icons.html';

export function BannerSection({ banner }: { banner: BannerVm }) {
  return (
    <div className="banner">
      <div className="banner-decorations">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
      <div className="banner-left">
        <div className="banner-icon-container">
          <FileIcon />
        </div>
        <div className="banner-text">
          <h1 className="banner-title">Task Tracer</h1>
          <p className="banner-subtitle">Review, manage and track all your tasks</p>
        </div>
      </div>
      <div className="banner-right">
        <div className="stat-circle">
          <span className="stat-number">{banner.totalTasks}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-circle">
          <span className="stat-number">{banner.completionRate}%</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>
    </div>
  );
}
