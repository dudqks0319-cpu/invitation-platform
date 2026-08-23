# frozen_string_literal: true

require 'optparse'

module InviteHubFmtXcodeCompat
  PINNED_FMT_VERSION = '11.0.2'
  MINIMUM_XCODE_VERSION = [26, 4].freeze
  ORIGINAL_GUARD =
    '#elif defined(__apple_build_version__) && __apple_build_version__ < 14000029L'
  PATCHED_GUARD = '#elif defined(__apple_build_version__)'

  module_function

  def apply!(pod_dir:, pod_version:, xcode_version:)
    return 'skipped_fmt_version' unless pod_version == PINNED_FMT_VERSION
    if (parse_version(xcode_version) <=> MINIMUM_XCODE_VERSION) == -1
      return 'skipped_xcode_version'
    end

    header_path = File.join(pod_dir, 'include', 'fmt', 'base.h')
    raise "fmt base header is missing: #{header_path}" unless File.file?(header_path)

    source = File.binread(header_path)
    lines = source.lines(chomp: true)

    if lines.include?(PATCHED_GUARD) && !lines.include?(ORIGINAL_GUARD)
      return 'already_patched'
    end

    guard_count = lines.count(ORIGINAL_GUARD)
    unless guard_count == 1
      raise "expected Apple Clang guard was not found exactly once (found #{guard_count})"
    end

    File.binwrite(header_path, source.sub(ORIGINAL_GUARD, PATCHED_GUARD))
    'patched'
  end

  def parse_version(version)
    match = version.match(/\A(\d+)\.(\d+)/)
    raise "could not parse Xcode version: #{version.inspect}" unless match

    [match[1].to_i, match[2].to_i]
  end
end

if $PROGRAM_NAME == __FILE__
  options = {}
  OptionParser.new do |parser|
    parser.on('--pod-dir PATH') { |value| options[:pod_dir] = value }
    parser.on('--pod-version VERSION') { |value| options[:pod_version] = value }
    parser.on('--xcode-version VERSION') { |value| options[:xcode_version] = value }
  end.parse!

  missing = %i[pod_dir pod_version xcode_version].reject { |key| options[key] }
  raise "missing required options: #{missing.join(', ')}" unless missing.empty?

  puts InviteHubFmtXcodeCompat.apply!(**options)
end
