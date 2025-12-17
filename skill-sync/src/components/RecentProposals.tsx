"use client";

import { useState } from "react";
import styles from "./RecentProposals.module.css";
import { deleteProposal } from "@/actions/proposal-actions";

interface ProposalSummary {
  id: string;
  title: string;
  offeredSkill: string;
  neededSkill: string;
  modality: string;
  status: string;
  createdAt: Date;
}

function formatDate(dateLike: Date | string) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProposalCard({
  proposal,
  index,
  onDelete,
}: {
  proposal: ProposalSummary;
  index: number;
  onDelete: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const result = await deleteProposal(proposal.id);
      if (result.success) {
        onDelete(proposal.id);
      } else {
        console.error("[ProposalCard] Delete failed:", result.message);
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("[ProposalCard] Delete error:", error);
      setIsDeleting(false);
    }
  };

  return (
    <article
      className={`${styles.card} ${styles.cardEnter}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={styles.cardGlow} aria-hidden="true" />
      <div className={styles.cardInner}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{proposal.title}</h3>
          <div className={styles.titleRowRight}>
            <span className={styles.statusPill}>{proposal.status}</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={styles.deleteButton}
              aria-label="Delete proposal"
            >
              {isDeleting ? "..." : "×"}
            </button>
          </div>
        </div>

        <div className={styles.fields}>
          <div>
            <div className={styles.fieldLabel}>Offered skill</div>
            <div className={styles.fieldValue}>{proposal.offeredSkill}</div>
          </div>
          <div>
            <div className={styles.fieldLabel}>Needed skill</div>
            <div className={styles.fieldValue}>{proposal.neededSkill}</div>
          </div>
        </div>

        <div className={styles.chipsRow}>
          <span className={styles.chip}>{proposal.modality}</span>
          <span className={styles.chip}>
            {proposal.status === "pending" ? "Awaiting match" : proposal.status}
          </span>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaLeft}>
            <span className={styles.dot} />
            <span>Active proposal</span>
          </div>
          <div>Created · {formatDate(proposal.createdAt)}</div>
        </div>
      </div>
    </article>
  );
}

export function RecentProposals({
  proposals,
  onProposalDeleted,
}: {
  proposals: ProposalSummary[];
  onProposalDeleted?: (id: string) => void;
}) {
  if (!proposals.length) {
    return (
      <div className={styles.emptyState}>
        <div className={`${styles.emptyCard} ${styles.emptyEnter}`}>
          <h3 className={styles.emptyTitle}>No proposals yet</h3>
          <p className={styles.emptyText}>
            Once you post a proposal, it will show up here with all the key details.
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...proposals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className={styles.grid} aria-live="polite">
      {sorted.map((proposal, index) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          index={index}
          onDelete={(id) => {
            onProposalDeleted?.(id);
          }}
        />
      ))}
    </div>
  );
}