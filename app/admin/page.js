'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SCENARIOS } from '@/lib/scenarios';
import Navbar from '@/components/Navbar';

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeConversations: 0,
    totalMessages: 0,
    clientsCount: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/conversations');
        if (response.ok) {
          const data = await response.json();
          const apiStats = data.stats || {};
          setStats({
            totalLeads: apiStats.totalLeads || 0,
            activeConversations: apiStats.activeConversations || 0,
            totalMessages: apiStats.totalMessages || 0,
            clientsCount: SCENARIOS.length,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats({
          totalLeads: SCENARIOS.length,
          activeConversations: 0,
          totalMessages: 0,
          clientsCount: SCENARIOS.length,
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Filter scenarios based on search query
  const filteredScenarios = SCENARIOS.filter((scenario) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      scenario.businessName.toLowerCase().includes(searchLower) ||
      scenario.industry.toLowerCase().includes(searchLower) ||
      scenario.address.toLowerCase().includes(searchLower)
    );
  });

  const statCards = [
    {
      label: 'Total Leads',
      value: stats.totalLeads,
      icon: '📊',
      accentColor: 'from-teal/20 to-teal/0',
      borderColor: 'border-teal/30',
    },
    {
      label: 'Active Conversations',
      value: stats.activeConversations,
      icon: '💬',
      accentColor: 'from-mint/20 to-mint/0',
      borderColor: 'border-mint/30',
    },
    {
      label: 'Total Messages',
      value: stats.totalMessages,
      icon: '✉️',
      accentColor: 'from-orange/20 to-orange/0',
      borderColor: 'border-orange/30',
    },
    {
      label: 'Clients',
      value: stats.clientsCount,
      icon: '👥',
      accentColor: 'from-purple/20 to-purple/0',
      borderColor: 'border-purple/30',
    },
  ];

  return (
    <div className="min-h-screen bg-navy grid-bg text-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Manage all your client conversations and AI scenarios
            </p>
          </div>

          {/* Stats Bar */}
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`glass glass-card border ${stat.borderColor} rounded-2xl p-6 hover-lift animate-fade-in-up fill-mode-both`}
                  style={{ animationDelay: `${100 + index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-gray-400 text-sm font-medium mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {isLoadingStats ? '—' : stat.value}
                      </p>
                    </div>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div
                    className={`h-1 w-full bg-gradient-to-r ${stat.accentColor} rounded-full`}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="relative">
              <div className="glass glass-card rounded-2xl border border-white/10 focus-within:border-teal/50 transition-colors duration-300 p-4 flex items-center gap-3">
                <span className="text-xl text-teal">🔍</span>
                <input
                  type="text"
                  placeholder="Search clients by name, industry, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-white placeholder-gray-500 outline-none w-full text-lg"
                />
              </div>
            </div>
            {searchQuery && (
              <p className="text-gray-400 text-sm mt-3">
                Found <span className="text-teal font-semibold">{filteredScenarios.length}</span> client{filteredScenarios.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Client Grid */}
          {filteredScenarios.length > 0 ? (
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScenarios.map((scenario, index) => (
                  <div
                    key={scenario.id}
                    className={`glass-card rounded-2xl border border-white/10 overflow-hidden hover-lift hover:border-teal/50 transition-all duration-300 animate-fade-in-up fill-mode-both`}
                    style={{ animationDelay: `${300 + index * 75}ms` }}
                  >
                    {/* Hero Image Section */}
                    <div className="relative h-40 overflow-hidden bg-gradient-to-b from-navy2 to-navy3">
                      <img
                        src={scenario.heroImage}
                        alt={scenario.businessName}
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-navy/80"></div>

                      {/* Online Indicator */}
                      <div className="absolute top-3 right-3">
                        <div className="flex items-center gap-2 glass glass-strong rounded-full px-3 py-1 border border-white/20">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs font-semibold text-white">
                            Online
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      {/* Business Name & Industry */}
                      <div className="mb-4">
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-3xl">{scenario.emoji}</span>
                          <div>
                            <h3 className="text-lg font-bold text-white leading-tight">
                              {scenario.businessName}
                            </h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                            style={{
                              backgroundColor: scenario.color + '20',
                              color: scenario.color,
                              border: `1px solid ${scenario.color}40`,
                            }}
                          >
                            {scenario.industry}
                          </span>
                        </div>
                      </div>

                      {/* Info Rows */}
                      <div className="space-y-2 mb-6 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <span>📱</span>
                          <a
                            href={`tel:${scenario.phone}`}
                            className="hover:text-teal transition-colors duration-200"
                          >
                            {scenario.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📧</span>
                          <a
                            href={`mailto:${scenario.email}`}
                            className="hover:text-teal transition-colors duration-200 truncate"
                          >
                            {scenario.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="truncate">{scenario.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🕐</span>
                          <span>{scenario.hours}</span>
                        </div>
                      </div>

                      {/* Colored Accent Line */}
                      <div
                        className="h-1 w-full rounded-full mb-6"
                        style={{ backgroundColor: scenario.color }}
                      ></div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          href={`/client/${scenario.id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 text-white hover-scale"
                          style={{
                            backgroundColor: scenario.color,
                            opacity: 0.9,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                          }}
                        >
                          👁️ View Client
                        </Link>
                        <Link
                          href={`/demo?client=${scenario.id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border transition-all duration-200 hover-scale text-teal border-teal/50 hover:border-teal hover:bg-teal/10"
                        >
                          🧪 Test AI
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="glass glass-card rounded-2xl border border-white/10 p-12 text-center">
                <p className="text-4xl mb-4">🔍</p>
                <h3 className="text-2xl font-bold text-white mb-2">
                  No clients found
                </h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search criteria or view all available clients
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 text-white bg-teal hover:bg-teal/90 hover-scale"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="border-t border-white/10 pt-8 mt-8">
              <p className="text-center text-gray-400 text-sm">
                Showing <span className="text-teal font-semibold">{filteredScenarios.length}</span> of{' '}
                <span className="text-mint font-semibold">{SCENARIOS.length}</span> clients
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
