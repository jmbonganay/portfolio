import { memo, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Handle,
  MarkerType,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Bot,
  FileText,
  GitBranch,
  Mail,
  Network,
  Webhook,
} from "lucide-react";
import "./business-components.css";

const iconMap = {
  webhook: Webhook,
  router: GitBranch,
  ai: Bot,
  docs: FileText,
  pdf: Network,
  gmail: Mail,
};

const PipelineNode = memo(function PipelineNode({ data }) {
  const Icon = iconMap[data.icon] || Network;

  return (
    <div className="pipeline-node">
      <Handle type="target" position={Position.Left} />

      <div className="pipeline-node__icon" aria-hidden="true">
        <Icon size={18} />
      </div>

      <div>
        <strong>{data.label}</strong>
        <span>{data.meta}</span>
      </div>

      <div className="pipeline-node__tooltip" role="tooltip">
        {data.tooltip}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
});

const nodeTypes = {
  pipelineNode: PipelineNode,
};

export default function PipelineArchitecture() {
  const nodes = useMemo(
    () => [
      {
        id: "webhook",
        type: "pipelineNode",
        position: { x: 0, y: 120 },
        data: {
          label: "Webhook Capture",
          meta: "Inbound trigger",
          icon: "webhook",
          tooltip:
            "Captures portfolio form payloads instantly without blocking the user experience.",
        },
      },
      {
        id: "router",
        type: "pipelineNode",
        position: { x: 250, y: 120 },
        data: {
          label: "Traffic Router",
          meta: "Intent sorting",
          icon: "router",
          tooltip:
            "Routes leads by inquiry type, keywords, submission intent, and scoping pathway.",
        },
      },
      {
        id: "gemini",
        type: "pipelineNode",
        position: { x: 500, y: 120 },
        data: {
          label: "Gemini AI Scoper",
          meta: "LLM generation",
          icon: "ai",
          tooltip:
            "Analyzes raw client input and generates a structured 3-phase technical scope instantly.",
        },
      },
      {
        id: "docs",
        type: "pipelineNode",
        position: { x: 750, y: 120 },
        data: {
          label: "Google Docs Compiler",
          meta: "Template merge",
          icon: "docs",
          tooltip:
            "Injects AI-generated scope content into a branded Google Doc template using merge fields.",
        },
      },
      {
        id: "pdf",
        type: "pipelineNode",
        position: { x: 1000, y: 120 },
        data: {
          label: "PDF Generator",
          meta: "Locked output",
          icon: "pdf",
          tooltip:
            "Compiles the final scope document into a portable PDF deliverable ready for client review.",
        },
      },
      {
        id: "gmail",
        type: "pipelineNode",
        position: { x: 1250, y: 120 },
        data: {
          label: "Gmail Dispatch",
          meta: "Autonomous delivery",
          icon: "gmail",
          tooltip:
            "Emails the generated proposal to the lead without manual handoff or inbox monitoring.",
        },
      },
    ],
    [],
  );

  const edges = useMemo(
    () =>
      [
        ["webhook", "router"],
        ["router", "gemini"],
        ["gemini", "docs"],
        ["docs", "pdf"],
        ["pdf", "gmail"],
      ].map(([source, target]) => ({
        id: `${source}-${target}`,
        source,
        target,
        type: "smoothstep",
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "rgba(45, 212, 191, 0.78)",
        },
        style: {
          stroke: "rgba(45, 212, 191, 0.68)",
          strokeWidth: 2,
        },
      })),
    [],
  );

  return (
    <section className="business-section pipeline-section" aria-labelledby="pipeline-title">
      <div className="business-section__header">
        <span className="business-eyebrow">System Proof</span>
        <h2 id="pipeline-title">From raw inquiry to AI-generated proposal.</h2>
        <p>
          A visual map of the autonomous Make.com, Gemini, Google Docs, PDF, and
          Gmail workflow behind the portfolio intake engine.
        </p>
      </div>

      <div className="pipeline-card">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          panOnScroll
          zoomOnScroll={false}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="rgba(45, 212, 191, 0.12)" gap={22} />
        </ReactFlow>
      </div>
    </section>
  );
}
