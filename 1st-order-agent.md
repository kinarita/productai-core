あなたはこのリポジトリの初期化担当エージェントです。
目的は「AI駆動開発のコアOS（ai-dev-core-template）」を、このリポジトリに安全に導入し、以後の開発の起点にすることです。

# 絶対ルール（守る）
- 変更はすべて feature ブランチで行う（main 直push禁止）
- docs ファースト（PLAN→実装→記録）
- 機密情報は絶対にコミットしない（.env / secrets / 個人パス）
- 既存ファイルがある場合は“上書きしない”。統合・追記・差分提案する

# 1) 計画（最初に提示）
以下A〜Eの計画を箇条書きで提示し、Done定義も書くこと。

# 2) 実行タスク
## A. リポジトリ現状スキャン
- ディレクトリ構成、入口（実行方法）、主要ファイルの有無を把握
- 既存の docs / .github / README 等があるか確認
- 結果を docs/00_PROJECT_OVERVIEW.md に「現状サマリ」として追記（無ければ新規作成）

## B. コアOSファイル群の導入（無ければ新規、あれば統合）
次のファイルを作成（または既存があれば統合）する：
- AGENT.md（コアOS憲法）
- CHANGELOG.md（Keep a Changelog: Unreleasedあり）
- docs/AI_DEV_GUIDELINE.md
- docs/01_PLAN.md（Tech Stack(Tentative→確定)欄を必ず含む）
- docs/02_SPEC.md
- docs/03_ARCHITECTURE.md（無ければ雛形でOK）
- docs/04_SETUP.md（無ければ雛形でOK）
- docs/05_TESTING.md（無ければ雛形でOK）
- docs/PROGRESS.md（今日の日付で初回初期化ログを残す）
- docs/VERSIONING.md（SemVer、source of truth=Git tag）
- docs/RELEASE_PROCESS.md（PR→CI→merge→tag→release）
- docs/ADR/0001-template.md
- .github/PULL_REQUEST_TEMPLATE.md
- .github/workflows/ci-placeholder.yml（技術スタック確定後に置換する前提のダミーCI）

※ 既存の同名ファイルがあれば上書きせず、良いところを残して統合し、差分が分かるように記述すること。

## C. README.md を最小整備（言語非依存）
- 概要（このプロジェクトは何か、目的）
- Quick Start は「TBD（技術スタック確定後に追記）」でよい
- docs への導線（docs/00〜05, PLAN, SPEC, ARCH, SETUP, TESTING, PROGRESS）
- 開発フロー（PR運用・CI・SemVer・タグ運用）を1セクションで明記
- Agent運用（AGENT.mdを最優先）を明記

## D. .gitignore を最小導入（言語非依存）
- .env
- tmp/
- .DS_Store
- *.log
- .pytest_cache/（もしPythonが入りそうなら。入れないならコメントで「必要なら追加」）
※ 言語依存の巨大な .gitignore は入れない（スタック確定後に追加）

## E. GitHub運用の起点を docs に残す
- docs/GITHUB_SETUP.md を作成（または追記）し、
  - clone / branch / PR / merge / tag / release の最小手順
  - gh CLI を使える場合の例（gh pr create --fill 等）
  - “タグはmain HEADのみ” “ユーザーOK後のみタグ作成” を明記

# 3) ブランチ運用とコミット
- ブランチ名: feature/bootstrap-core-os
- Conventional Commit で1〜3コミットにまとめる（例: chore: bootstrap core dev OS）
- 変更後、ローカルで可能な範囲のチェックを行う（最低: ファイル生成・リンク切れがないか）
- push まで行う
- gh が使えるなら PR を作成（gh pr create --fill）
  - 使えない場合は PR 作成URLを提示する

# 4) 出力フォーマット（必須）
最後のレポートは必ずこの順で出す：
1. 計画（Done定義つき）
2. 変更点（ファイル単位一覧）
3. docs 更新点（何をどこに書いたか）
4. PR URL（作成した場合）
5. 次の一手（技術スタック確定→CI置換→SETUP/TESTING具体化）

# 5) 重要：ここから先は“技術スタック確定”がトリガー
初期化完了後、ユーザーが docs/01_PLAN.md の Tech Stack を確定したら、
そのスタックに合わせて ci.yml / SETUP / TESTING を具体化する提案を出すこと。

