'use client';

import { motion } from 'framer-motion';

interface HealthTrendPoint {
    date: string;
    total: number;
    accuracy: number;
    deflection: number;
}

interface HealthTrendChartProps {
    data: HealthTrendPoint[];
}

export function HealthTrendChart({ data }: HealthTrendChartProps) {
    if (!data || data.length < 2) {
        return (
            <div className="h-48 flex items-center justify-center text-muted-foreground bg-muted/5 rounded-lg border border-dashed text-sm">
                Trend analizi için yeterli veri henüz toplanmadı.
            </div>
        );
    }

    const width = 600;
    const height = 200;
    const padding = 30;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.length;
    const xStep = chartWidth / (points - 1);

    const getPath = (key: 'accuracy' | 'deflection') => {
        return data.map((d, i) => {
            const x = padding + i * xStep;
            const y = height - padding - (d[key] / 100) * chartHeight;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    const accuracyPath = getPath('accuracy');
    const deflectionPath = getPath('deflection');

    return (
        <div className="relative w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                {/* Y-Axis Grid Lines */}
                {[0, 25, 50, 75, 100].map((tick) => {
                    const y = height - padding - (tick / 100) * chartHeight;
                    return (
                        <g key={tick}>
                            <line
                                x1={padding}
                                y1={y}
                                x2={width - padding}
                                y2={y}
                                stroke="currentColor"
                                strokeOpacity="0.1"
                                strokeDasharray="4 4"
                            />
                            <text
                                x={padding - 5}
                                y={y}
                                textAnchor="end"
                                alignmentBaseline="middle"
                                fontSize="10"
                                fill="currentColor"
                                opacity="0.5"
                            >
                                {tick}%
                            </text>
                        </g>
                    );
                })}

                {/* X-Axis labels (simplistic) */}
                {data.map((d, i) => {
                    if (i % Math.ceil(data.length / 5) !== 0 && i !== data.length - 1) return null;
                    const x = padding + i * xStep;
                    const dateStr = new Date(d.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
                    return (
                        <text
                            key={i}
                            x={x}
                            y={height - padding + 15}
                            textAnchor="middle"
                            fontSize="10"
                            fill="currentColor"
                            opacity="0.5"
                        >
                            {dateStr}
                        </text>
                    );
                })}

                {/* Lines */}
                <motion.path
                    d={deflectionPath}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                <motion.path
                    d={accuracyPath}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                />

                {/* Markers */}
                {data.map((d, i) => {
                    const x = padding + i * xStep;
                    const yAcc = height - padding - (d.accuracy / 100) * chartHeight;
                    const yDef = height - padding - (d.deflection / 100) * chartHeight;
                    return (
                        <g key={i}>
                            <circle cx={x} cy={yAcc} r="4" fill="#10B981" stroke="white" strokeWidth="1" />
                            <circle cx={x} cy={yDef} r="4" fill="#3B82F6" stroke="white" strokeWidth="1" />
                        </g>
                    );
                })}
            </svg>

            <div className="flex justify-center gap-6 mt-4 text-xs font-semibold">
                <div className="flex items-center gap-2 text-emerald-500">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" /> RAG Doğruluğu
                </div>
                <div className="flex items-center gap-2 text-blue-500">
                    <span className="w-3 h-3 rounded-full bg-blue-500" /> Savuşturma Oranı
                </div>
            </div>
        </div>
    );
}
