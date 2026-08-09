"use client";

import { HoverCard } from "@/components/lab/HoverCard";
import { RandomizedText } from "@/components/lab/RandomizedText";
import { OMI } from "@/data/lab-facts";
import type { LiveGithub } from "@/hooks/use-live-github";
import { GITHUB_ACTIVITY } from "@/data/github-activity";

const numberFormat = new Intl.NumberFormat("en-US");

/**
 * "omi" on its own tells a reader nothing, so it gets the same treatment as
 * Terry: what the thing is, then what of it is mine, then the live count of
 * how much of it I've actually touched.
 */
export function OmiCard({
  children,
  github,
}: {
  children: React.ReactNode;
  github: LiveGithub;
}) {
  return (
    <HoverCard
      className="omi"
      trigger={
        <a
          className="omi-name"
          href={OMI.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      }
    >
      {(open) => (
        <span className="omi-inner" key={open}>
          <span className="hc-title">
            {OMI.name}
            <em>{OMI.meta}</em>
          </span>
          <span className="hc-body">
            <RandomizedText delay={0.06}>{OMI.body}</RandomizedText>
          </span>
          <span className="hc-note">
            <RandomizedText delay={0.18}>{OMI.mine}</RandomizedText>
          </span>
          <span className="hc-stats">
            <span>
              <b>{numberFormat.format(GITHUB_ACTIVITY.total.pullRequests)}</b>
              <i>my prs on it</i>
            </span>
            <span>
              <b>{numberFormat.format(GITHUB_ACTIVITY.total.commits)}</b>
              <i>my commits</i>
            </span>
            <span>
              <b>{github.omiThisMonth}</b>
              <i>this month</i>
            </span>
          </span>
        </span>
      )}
    </HoverCard>
  );
}
